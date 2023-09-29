# ovpn-dpi-evasion

```bash
Wrapper over iptables to bypass DPI over vpn handshake
```

## Example

```js
const MITM = require("ovpn-dpi-evasion");

const mitm = new MITM("tun0");
const ovpnHandshake = "04 00 00 00";

mitm.intercept((packet) => {
  if (packet === ovpnHandshake) {
    return "00 00 00 00" + packet.substring(8);
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
