# ovpn-dpi-evasion

```bash
Wrapper over iptables to bypass DPI over vpn handshake
```

## Example

```js
const MITM = require("ovpn-dpi-evasion");

const mitm = new MITM("tun0");
const ovpnHandshake = Buffer.from([0x04, 0x00, 0x00, 0x00]);

mitm.intercept((packet) => {
  if (packet.compare(ovpnHandshake)) {
    return Buffer.from([0x00, 0x00, 0x00, 0x00]).concat(packet);
  }
});
```

## Superuser mitigation

```bash
sudo visudo
```

```bash
...
$(echo $USER) ALL = NOPASSWD: $(which tcpdump)
```

## Test

```bash
npm test
```
