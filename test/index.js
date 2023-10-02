const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const MITM = require("..");

describe("MITM", () => {
  it("should throw on interface name injection", () => {
    const actual = () => new MITM("rm -rf /");

    assert.throws(actual);
  });

  it("should not throw on alphanumeric interface name", () => {
    const actual = () => new MITM("rmrf");

    assert.doesNotThrow(actual);
  });

  it("should intercept ovpn", (done) => {
    const mitm = new MITM("tun0");
    const ovpnHandshake = Buffer.from([0x04, 0x00, 0x00, 0x00]);

    mitm.intercept((packet) => {
      if (!packet.compare(ovpnHandshake)) {
        assert.ok();
        done();

        return Buffer.from([0x00, 0x00, 0x00, 0x00]).concat(packet);
      }
    });
  });
});
