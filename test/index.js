const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const MITM = require("..");

describe("MITM", () => {
  it("should intercept ovpn", (done) => {
    const mitm = new MITM("tun0");
    const ovpnHandshake = "04 00 00 00";

    mitm.intercept((packet) => {
      if (packet === ovpnHandshake) {
        assert.ok();
        done();

        return "00 00 00 00" + packet.substring(8);
      }
    });
  });
});
