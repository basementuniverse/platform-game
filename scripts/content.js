Z.content = (function() {
	"use strict";
	
	return {
		items: [],			// The most recently loaded list of content items
		loaders: [],		// A list of content loader functions
		
		// Registers a custom content loader function, used to load a specific type of resource.
		// The loader should take the following arguments:
		//	callback:	A function to call when the resource has finished loading (with the loaded
		//				resource as it's only argument)
		//	path:		The resource path
		//	data:		(Optional) The resource data
		registerLoader: function(id, loader) {
			this.loaders[id] = loader;
		},
		
		// Loads a list of content assets and calls allFinishedCallback when done (only argument
		// will be an array of objects indexed by item id). Each item has the following properties:
		//	item.id:		A unique identifier for the content item
		//	item.loader:	The function used to load the object. Should take a callback as the
		//					first argument (which should be called when the item has finished
		//					with the loaded item as the only argument)
		//	item.args:		An array of arguments to pass to the loader
		//	item.args[0]:	The item path
		//	item.args[1]:	(Optional) The item inline data (this will skip AJAX call)
		load: function(items, allFinishedCallback) {
			if (items.length == 0) {	// No items to load
				allFinishedCallback([]);
				return;
			}
			var content = [],
				loadCount = items.length,
				loaded = 0;
			$(items).each(function(i, v) {
				v.args.unshift(function (item) {
					content[v.id] = item;
					
					// Update loading screen progress
					Z.utilities.loading(true, Math.round((++loaded / items.length) * 100) + "%");
					
					// If all items have finished, hide the loading screen and callback
					if (--loadCount <= 0) {
						Z.utilities.loading(false);
						Z.content.items = content;
						allFinishedCallback(content);
					}
				});
				v.loader.apply(undefined, v.args);
			});
		}
	};
}());