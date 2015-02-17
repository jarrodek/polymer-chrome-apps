Polymer({

  fileContent: '',
  fileName: 'file.txt',
  allFiles: [],
  useSync: true,

  onFilesystemFileRead: function(event, details, sender){
    console.log('onFilesystemFileRead',event, details, sender);
    this.fileContent = details.content;
    this.$.log.append('File "'+ this.fileName +'" read.');
  },
  onFilesystemFileWrite: function(event, details, sender){
    console.log('onFilesystemFileWrite', event, details, sender);
    this.$.log.append('File "'+ this.fileName +'" has been saved.');
  },
  onFilesystemError: function(event, details, sender){
    console.error('onFilesystemError',event, details, sender);
    this.$.log.append('Error operating on file: "'+ this.fileName +'": ' + details.message, true);
  },

  readFile: function(){
    this.$.log.append('Reading the file.');
    this.$.fileSystem.read();
  },

  writeFile: function(){
    this.$.log.append('Writing  to the file.');
    this.$.fileSystem.write();
  },

  listFiles: function(){
    this.allFiles = [];
    this.$.listDialog.toggle();
    this.$.fileSystem2.list();
  },

  onFilesystemList: function(event, details, sender){
    if(details && details.files && details.files.length > 0){
      details.files.forEach(function(item){
        this.allFiles.push(item.name);
      }.bind(this));
    }
  },

  selectFile: function(event, details, sender){
    var name = sender.dataset['name'];
    if(!name) return;

    this.fileName = name;
    this.$.listDialog.toggle();
  },

  deleteFile: function(event, details, sender){
    this.$.fileSystem.remove();
  },

  onFilesystemRemoved: function(event, details, sender){
    this.$.log.append('The file "'+ this.fileName +'" has been removed from the filesystem.');
  }

});