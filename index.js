"use strict";

const EventEmitter = require("node:events");
const { spawn } = require("node:child_process");

class MITM extends EventEmitter {
  #interfaceName;
  #alphanumeric = /^[a-z0-9]+$/i;

  constructor(interfaceName) {
    super();

    if (interfaceName && !this.#alphanumeric.test(interfaceName)) {
      throw new RangeError("Interface should be alphanumeric characters");
    }

    this.#interfaceName = interfaceName;
  }

  intercept(callback) {
    const tcpdump = spawn("sudo", [
      "tcpdump",
      "-i",
      this.#interfaceName,
      "-n",
      "-X",
    ]);

    tcpdump.stdout.setEncoding("utf-8");

    tcpdump.stderr.on("data", (error) => {
      return console.error(error.toString("utf8"));
    });

    tcpdump.stdout.on("data", (stream) => {
      const packet = this.extractPacket(stream);

      if (packet) {
        this.sendPacket(callback(packet));
      }
    });
  }

  desync({ ip, port: { source, destination }, protocol }) {
    if (!protocol || !protocol.length || !["tcp", "udp"].includes(protocol)) {
      throw new Error("Protocol required (tcp or udp)");
    }

    if (
      !port ||
      [source, destination].some((port) => !Number.isInteger(port))
    ) {
      throw new Error("Port should be positive integer");
    }

    const nping = spawn("sudo", [
      "nping",
      `--${protocol}`,
      "--count",
      "1",
      "--data-length",
      "16",
      "--source-port",
      source,
      "--dest-port",
      destination,
      ip,
      port,
    ]);

    nping.stdout.setEncoding("utf-8");

    tcpdump.stderr.on("data", (error) => {
      return console.error(error.toString("utf8"));
    });

    nping.stdout.on("data", (stream) => {
      const packet = this.extractPacket(stream);

      this.emit("desync", stream);

      if (packet) {
        this.sendPacket(callback(packet));
      }
    });
  }

  extractPacket(stream) {
    const bytesRegex = /0x[0-9a-fA-F]{2}\s/g;
    const matches = stream.match(bytesRegex);

    const moreThanFourBytes = matches?.length > 4;

    if (moreThanFourBytes) {
      return Buffer.from(matches.slice(0, 4).join("").replace(/ /g, ""), "hex");
    }
  }

  sendPacket(packet) {
    const sendPacket = spawn("echo", ["-n", "-e", packet.toString("hex")]);
    const iptables = spawn("sudo", [
      "iptables",
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
