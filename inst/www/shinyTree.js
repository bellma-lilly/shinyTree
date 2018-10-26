var shinyTree = function(){
  callbackCounter = 0;
  sttypes = null;

  var treeOutput = new Shiny.OutputBinding();
  $.extend(treeOutput, {
    find: function(scope) {
      return $(scope).find('.shiny-tree');
    },
    renderValue: function(el, data) {
      // Wipe the existing tree and create a new one.
      $elem = $('#' + el.id);
      
      $elem.jstree('destroy');
      
      $elem.html(data);
      var plugins = [];
      if ($elem.data('st-checkbox') === 'TRUE'){
        plugins.push('checkbox');
      }
      if ($elem.data('st-search') === 'TRUE'){
        plugins.push('search');
      }      
      if ($elem.data('st-dnd') === 'TRUE'){
        plugins.push('dnd');
      }
      if ($elem.data('st-types') === 'TRUE'){
        plugins.push('types');
      }
      
      var tree = $(el).jstree({'core' : { 
        "check_callback" : ($elem.data('st-dnd') === 'TRUE'), 
        'themes': {'name': $elem.data('st-theme'), 'responsive': true, 'icons': ($elem.data('st-theme-icons') === 'TRUE'), 'dots': ($elem.data('st-theme-dots') === 'TRUE') }
          },
          "types" : sttypes,
          plugins: plugins});
    }
  });
  Shiny.outputBindings.register(treeOutput, 'shinyTree.treeOutput');
  
  var treeInput = new Shiny.InputBinding();
  $.extend(treeInput, {
    find: function(scope) {
      return $(scope).find(".shiny-tree");
    },
    getType: function(){
      return "shinyTree"
    },
    getValue: function(el, keys) {
                

      /**
       * Prune an object recursively to only include the specified keys.
       * Then add any data.
       **/
      var fixOutput = function(arr, keys){
        var arrToObj = function(ar){
          var obj = {};
          $.each(ar, function(i, el){
            obj['' + i] = el;
          })
          return obj;
        }
        
        var toReturn = [];
        $.each(arr, function(i, obj){
          if (obj.children && obj.children.length > 0){
            obj.children = arrToObj(fixOutput(obj.children, keys));
          }
          
          var clean = {};
          $.each(obj, function(key, val){
            if (keys.indexOf(key) >= 0) {
                if (typeof val === 'string'){
                  clean[key] = val.trim();
                } else {
                  clean[key] = val; 
                }
              }
          });
          //get the id and add the data
          console.log(clean["id"]);
          toReturn.push(clean);
        });
        
        result = arrToObj(toReturn)
        callbackCounter++;
        result.callbackCounter = callbackCounter;

        return arrToObj(result);
      }
      
      var tree = $.jstree.reference(el);
      if (tree) { // May not be loaded yet.
        if(tree.get_container().find("li").length>0) { // The tree may be initialized but empty
          var js = tree.get_json();
          var fixed = fixOutput(js, ['id', 'state', 'text','children']);
          return js;
        }
      }
    },
    setValue: function(el, value) {},
    subscribe: function(el, callback) {
      $(el).on("open_node.jstree", function(e) {
        callback();
      });
      
      $(el).on("close_node.jstree", function(e) {
        callback();
      });
      
      $(el).on("changed.jstree", function(e) {
        callback();
      });
      
      $(el).on("ready.jstree", function(e){
        // Initialize the data.
        callback();
      })
      
      $(el).on("move_node.jstree", function(e){
        callback();
      })
    },
    unsubscribe: function(el) {
      $(el).off(".jstree");
    },
    receiveMessage: function(el, message) {
      // This receives messages of type "updateTree" from the server.
      if(message.type == 'updateTree' && typeof message.data !== 'undefined') {
          console.log($(el).jstree(true).settings.core.data);
          $(el).jstree(true).settings.core.data = JSON.parse(message.data);
          $(el).jstree(true).refresh(true, true);
      }
    }
  });
  
  Shiny.inputBindings.register(treeInput); 
  
  var exports = {};
  
  exports.initSearch = function(treeId, searchId){
    $(function(){
      var to = false;
      $('#' + searchId).keyup(function () {
        if(to) { clearTimeout(to); }
        to = setTimeout(function () {
          var v = $('#' + searchId).val();
          $.jstree.reference('#' + treeId).search(v);
        }, 250);
      });
    });    
  }
  
  function process(key,value) {
    if(key == "id"){
      info = $('#tree').jstree(true).get_node(value).data
      console.log(key + " : "+value)
      console.log(info);
    }
  }

  function traverse(o,func) {
    for (var i in o) {
        func.apply(this,[i,o[i]]);  
        if (o[i] !== null && typeof(o[i])=="object") {
            //going one step down in the object tree!!
            traverse(o[i],func);
        }
    }
}
  
  return exports;
}()
