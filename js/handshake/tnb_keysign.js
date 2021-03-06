/**
 * Use the `tnb_keysign` methods listed below to issue requests to the TNB blockchain.
 */
const tnb_keysign = {
	current_id: 1,
	requests: {},
	handshake_callback: null,
	/**
	 * This function is called to verify keysign installation on a user's device
	 * @param {function} callback Confirms keysign installation
	 */
	requestHandshake: function (callback) {
		this.handshake_callback = callback;
		this.dispatchCustomEvent('swHandshake_tnb', '');
	},

	/**
	 * Requests a transfer
	 * @param {Array} txs Array of transactions to process {to: "accountNumber", amount: 1, memo: "hi"}
	 * @param {function} callback keysign's response to the request
	 * @param {string} bank optional bank to use
	 * @param {string} code optional code for verification
	 */
	requestTransfer: function (txs, callback, bank, code = '') {
		const request = {
			type: 'transfer',
			txs,
			bank,
			code,
		};
		this.dispatchCustomEvent('swRequest_tnb', request, callback);
	},

	/**
	 * Requests verification
	 * @param {String} accountNumber TNB accountNumber to verify
	 * @param {function} callback keysign's response to the request
	 * @param {string} code optional code for verification
	 */
	requestVerify: function (accountNumber, callback, code = '') {
		const request = {
			type: 'verify',
			accountNumber,
			code,
		};
		this.dispatchCustomEvent('swRequest_tnb', request, callback);
	},

	// Send the customEvent
	dispatchCustomEvent: function (name, data, callback) {
		this.requests[this.current_id] = callback;
		data = Object.assign(
			{
				request_id: this.current_id,
			},
			data
		);
		document.dispatchEvent(
			new CustomEvent(name, {
				detail: data,
			})
		);
		this.current_id++;
	},
};

window.addEventListener(
	'message',
	function (event) {
		// We only accept messages from ourselves
		if (event.source !== window) return;

		if (event.data.type && event.data.type === 'tnb_keysign_response') {
			const response = event.data.response;
			if (response && response.request_id) {
				if (tnb_keysign.requests[response.request_id]) {
					tnb_keysign.requests[response.request_id](response);
					delete tnb_keysign.requests[response.request_id];
				}
			}
		} else if (
			event.data.type &&
			event.data.type === 'tnb_keysign_handshake'
		) {
			if (tnb_keysign.handshake_callback) {
				tnb_keysign.handshake_callback();
			}
		}
	},
	false
);

window.tnb_keysign = tnb_keysign;
