define(function (require) {
	'use strict';

	describe('math', function () {
		var Editor = require('ft/editor/editor').Editor,
			editor;

		beforeEach(function () {
			editor = new Editor('');
		});

		afterEach(function () {
			editor.removeAndCleanupForCollection();
		});

		it('should add 1 + 1', function () {
			editor.setTextContent('# test.math\n1 + 1 =>');
			expect(editor.textContent().substr(-1)).toEqual('2');
		});
	});
});
