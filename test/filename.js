var assert = require('assert')
  , path = require('path');

var AssetManager = require('../lib/assets').AssetManager
  , fixtures = path.join(__dirname, 'fixtures');

function setup(directory, options) {
    var manager = new AssetManager(path.join(fixtures, directory), options);
    manager.indexAssets();
    manager.hashAssets();
    return manager;
}

describe('Filenames', function () {

    it('should generate filenames for assets', function () {
        var manager = setup('simple-assets');
        assert.equal(manager.assetFilename('jquery.js'), 'asset-82470a0982f62504a81cf60128ff61a2-jquery.js');
    });

    it('should allow for a configurable hash length', function () {
        var manager = setup('simple-assets', { hashLength: 8 });
        assert.equal(manager.assetFilename('jquery.js'), 'asset-82470a09-jquery.js');
    });

    it('should emit an error when the asset could not be found', function () {
        var manager = setup('simple-assets')
          , had_error = false;
        manager.on('error', function (err) {
            assert.equal(err.message, 'Asset "bootstrap.js" could not be found');
            had_error = true;
        });
        assert.equal(manager.assetFilename('bootstrap.js'), '');
        assert(had_error, 'Expected an error');
    });

    it('should generate filenames for asset bundles', function () {
        var manager = setup('simple-assets');
        assert.equal(manager.assetFilename('ie8.js', { include: [ 'html5shiv.js', 'respond.js' ] }),
            'asset-b5d5d67465f661c1a12da394e502b391-ie8.js');
    });

    it('should emit an error when an asset in the bundle could not be found', function () {
        var manager = setup('simple-assets')
          , had_error = false;
        manager.on('error', function (err) {
            assert.equal(err.message, 'Asset "bootstrap.js" could not be found ' +
                'when building asset "libraries.js"');
            had_error = true;
        });
        manager.assetFilename('libraries.js', { include: [ 'jquery.js', 'bootstrap.js' ] });
        assert(had_error, 'Expected an error');
    });

    it('should only require the user to define an asset once', function () {
        var manager = setup('simple-assets');
        var expected = 'asset-b5d5d67465f661c1a12da394e502b391-ie8.js';
        assert.equal(manager.assetFilename('ie8.js',
            { include: [ 'html5shiv.js', 'respond.js' ] }), expected);
        assert.equal(manager.assetFilename('ie8.js'), expected);
    });

    it('should ignore duplicates in the list of assets in a bundle', function () {
        var manager = setup('simple-assets');
        var tag = manager.assetFilename('ie8.js', { include: [ 'html5shiv.js', 'respond.js' ] });
        assert.equal(tag, 'asset-b5d5d67465f661c1a12da394e502b391-ie8.js');
        tag = manager.assetFilename('ie8-b.js', { include: [
            'respond.js', 'html5shiv.js', 'respond.js', 'respond.js', 'html5shiv.js'
        ] });
        assert.equal(tag, 'asset-b5d5d67465f661c1a12da394e502b391-ie8-b.js');
    });

    it('should require a populated include array when defining asset bundles', function () {
        var manager = setup('simple-assets')
          , had_error = false;
        manager.on('error', function () {
            had_error = true;
        });
        manager.assetFilename('libraries.js', { include: [] });
        assert(had_error, 'Expected an error');
    });

    it('should support glob when including assets in a bundle', function () {
        var manager = setup('simple-assets');
        var tag = manager.assetFilename('all.js', { include: [
            'html5shiv.js', 'respond.js', 'jquery.js'
        ] });
        assert.equal(tag, 'asset-c919d0e16fda90c516ca98655b7b6222-all.js');
        tag = manager.assetFilename('all-b.js', { include: '*.js' });
        assert.equal(tag, 'asset-c919d0e16fda90c516ca98655b7b6222-all-b.js');
        tag = manager.assetFilename('all-c.js', { include: [
            '{jquery,respond}.js', 'html*.js'
        ] });
        assert.equal(tag, 'asset-c919d0e16fda90c516ca98655b7b6222-all-c.js');
    });

    it('should emit an error when a glob pattern doesn\'t match any assets', function () {
        var manager = setup('simple-assets')
          , had_error = false;
        manager.on('error', function (err) {
            assert.equal(err.message, 'No assets matched the pattern "*.min.js" ' +
                'when building asset "libraries.js"');
            had_error = true;
        });
        manager.assetFilename('libraries.js', { include: '*.min.js' });
        assert(had_error, 'Expected an error');
    });

});
