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

```js
const mitm = new MITM();
const ip = "1.2.3.4";
const port = 1234;

mitm.on("desync", (buffer) => {
  // ...
});

mitm.desync(ip, port, "tcp");
```

## Superuser mitigation

```bash
sudo visudo
```

```bash
...
$(echo $USER) ALL = NOPASSWD: $(which tcpdump)
```

## Deps

- `nmap`
- `tcpdump`
- `iptables`

## Test

```bash
npm test
```
