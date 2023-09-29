"use strict";

const { spawn } = require("node:child_process");

class MITM {
  constructor(interfaceName) {
    if (!/^[a-z0-9]+$/i.test(interfaceName)) {
      throw new RangeError("Interface should be alphanumeric characters");
    }

    this.interfaceName = interfaceName;
  }

  intercept(callback) {
    const tcpdump = spawn("tcpdump", ["-i", this.interfaceName, "-n", "-X"]);
    tcpdump.stdout.setEncoding("utf-8");

    tcpdump.stderr.on("data", console.error);

    tcpdump.stdout.on("data", (data) => {
      console.log(data);
      const packet = this.extractPacket(data);

      if (packet) {
        this.sendPacket(callback(packet));
      }
    });
  }

  extractPacket(data) {
    const bytesRegex = /0x[0-9a-fA-F]{2}\s/g;
    const matches = data.match(bytesRegex);

    const moreThanFourBytes = matches?.length >= 4;

    if (moreThanFourBytes) {
      return matches.slice(0, 4).join("").replace(/ /g, "");
    }
  }

  sendPacket(packet) {
    const sendPacket = spawn("echo", ["-n", "-e", packet]);
    const iptables = spawn("iptables", [
      "-A",
      "FORWARD",
      "-i",
      this.interfaceName,
      "-j",
      "DROP",
    ]);

    sendPacket.stdout.pipe(iptables.stdin);
  }
}

module.exports = MITM;
