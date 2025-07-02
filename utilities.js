const { stringToHex, isHex, bnToHex, hexToBn, hexToU8a, hexToString, u8aToHex, stringToU8a, bnToU8a } = polkadotUtil;
const { blake2AsHex, keccak256AsU8a, xxhashAsHex, encodeAddress, decodeAddress, blake2AsU8a } = polkadotUtilCrypto;
const { Keyring } = polkadotKeyring;


/* Ethereum to Substrate Address */
let e2s = {
	"eth": document.getElementById("eth-e2s"),
	"sub": document.getElementById("sub-e2s"),
};

e2s.eth.addEventListener("input", eth2Sub);
e2s.sub.addEventListener("input", sub2Eth);

function eth2Sub() {
	try {
		let ethAddress = e2s.eth.value;

		// Ensure the address is a valid Ethereum address (20 bytes)
		if (!ethAddress.startsWith('0x') || ethAddress.length !== 42) {
			e2s.sub.value = "Invalid Ethereum address";
			return;
		}

		// Convert Ethereum address to bytes and append the `e`
		const ethBytes = hexToU8a(ethAddress);
		// Create Substrate address with all `0xee`.
		const substrateBytes = new Uint8Array(32).fill(0xee);
		// Copy the Ethereum bytes into the first 20 bytes
		substrateBytes.set(ethBytes, 0);

		// Convert to a Substrate address.
		const ss58Address = encodeAddress(substrateBytes, 42);

		e2s.sub.value = ss58Address;
	} catch (e) {
		e2s.sub.value = "Error";
		console.error(e);
	}
}

// See https://github.com/paritytech/polkadot-sdk/blob/c4b8ec123afcef596fbc4ea3239ff9e392bcaf36/substrate/frame/revive/src/address.rs?plain=1#L101-L113
function sub2Eth() {
	try {
		let substrateAddress = e2s.sub.value;

		// Decode the Substrate address into raw bytes.
		const substrateBytes = decodeAddress(substrateAddress);

		// if last 12 bytes are all `0xEE`, 
		// we just strip the 0xEE suffix to get the original address
		if (substrateBytes.slice(20).every(b => b === 0xEE)) {
			e2s.eth.value = u8aToHex(substrateBytes.slice(0, 20));
			return;
		}

		// this is an (ed|sr)25510 derived address
		// We Hash it with keccak_256 and take the last 20 bytes
		const ethBytes = keccak256AsU8a(substrateBytes).slice(-20);

		// Convert to Ethereum address.
		const ethAddress = u8aToHex(ethBytes);

		e2s.eth.value = ethAddress;
	} catch (e) {
		e2s.eth.value = "Error";
		console.error(e);
	}
}

