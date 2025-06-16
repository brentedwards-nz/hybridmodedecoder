# RemoteHostScreen MIDI SysEx Protobuf Decoder

This tool decodes MIDI SysEx messages containing protobuf-encoded data for the RemoteHostScreen protocol.

## Prerequisites

- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)

## Setup

### 1. Install Node.js

- Download the latest LTS version from [nodejs.org](https://nodejs.org/)
- Run the installer and follow the prompts
- Verify installation in a terminal:
  ```
  node -v
  npm -v
  ```

### 2. Clone or Download This Repository

Open a terminal and navigate to your desired folder, then run:
```sh
git clone <repository-url>
cd RemoteHostScreen
```
Or download and extract the ZIP, then open the folder in your terminal.

### 3. Install Dependencies

```sh
npm install
```

## Usage

The main script is `decode.js`.  
It takes a MIDI SysEx message as a hex string argument and decodes the protobuf message.

### Example

```sh
node decode.js "F0 70 00 00 01 00 62 0B 08 40 10 00 F7"
```

- The argument must be a space-separated hex string, including the `F0` (start) and `F7` (end) bytes.

### Output

The script will print:
- The parsed hex array
- The extracted payload
- The decoded protobuf bytes
- The decoded message as JSON

## Troubleshooting

- Make sure `hybrid_mode.proto` is present in the same directory as `decode.js`.
- Always run the script using `node`, not by double-clicking the `.js` file.
- If you see errors about missing modules, run `npm install` again.

## License