Polymer({
  append: function(message, error){
    if(!error) error = false;

    var item = document.createElement('app-log-item');
    item.message = message;
    var d = new Date();
    item.timestamp = d.toLocaleDateString() + " " + d.toLocaleTimeString() + "." + d.getMilliseconds();
    if(error){
      item.error = true;
    }
    this.$.content.appendChild(item);
  }
});