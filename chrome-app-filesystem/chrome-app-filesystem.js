window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

Polymer('chrome-app-filesystem', {
  /**
   * Fired when a file is read.
   *
   * @event file-read
   */
  /**
   * Fired when content has been written to the file.
   *
   * @event file-write
   */
  /**
   * Fired when an error is received.
   *
   * @event error
   */
  /**
   * Fired when the file has been removed.
   *
   * @event removed
   */
  /**
   * Fired when files has been read from the filesystem.
   *
   * @event directory-read
   */

  publish: {

    /**
     * Determine if syncable filesystem should be used.
     *
     * Using this option you need to add "syncFileSystem" permission in your manifest.js file:
     *
     * //...
     * "permissions": [
     *  //...
     *  "syncFileSystem"
     * ]
     * //...
     *
     * API Docs: https://developer.chrome.com/apps/syncFileSystem
     *
     * @attribute syncable
     * @type boolean
     * @default false
     */
    syncable: false,

    /**
     * Name of the file.
     *
     * @attribute filename
     * @type String
     * @default ''
     */
    filename: '',
    /**
     * If true the file will be read from the filesystem as soon as
     * filename attribute change.
     *
     * @attribute auto
     * @type boolean
     * @default false
     */
    auto: false,
    /**
     * If using local filesystem storage quota must be provided.
     * User Agent need to know how many quota the app require.
     *
     * UA may not grant requested amount of disk space if e.g. "quota" is
     * bigger than available space.
     * Number of bytes available for the app is hold in "grantedQuota" attreibute.
     *
     * Note that the app must set quota number > 0 for local FS or it will
     * cause an error during file save.
     *
     * @attribute quota
     * @type number
     * @default 0
     */
    quota: 0,
    /**
     * A content of the file.
     * If auto attribute is true it will write content to file each time
     * it change.
     *
     * @todo: add support for other types than String.
     *
     * @attribute content
     * @type String|ArrayBuffer|Blob
     * @default ''
     */
    content: ''
  },

  /**
   * File mime-type.
   */
  mime: 'text/plain',

  /**
   * Granted by te user agent number of bytes avaibale to use by the app.
   * It will be filled up if "syncable" attribute is false and the app
   * already requested filesystem.
   *
   * @attribute grantedQuota
   * @type number
   * @default 0
   */
  grantedQuota: 0,

  filenameChanged: function(){
    this.runAutoRead();
  },

  contentChanged: function(){
    this.runAutoWrite();
  },

  runAutoRead: function(){
    if(this.auto === true || this.auto === "true"){
      this.read();
    }
  },

  runAutoWrite: function(){
    if(this.auto === true || this.auto === "true"){
      this.write();
    }
  },

  read: function(){
    this.readFile();
  },

  write: function(){
    this.getFile()
    .then(this._truncate)
    .then(function() {
      return this.getFile();
    }.bind(this))
    .then(this._writeFileEntry.bind(this))
    .then(function(fileEntry){
      this.fire('file-write');
    }.bind(this))
    .catch(function(reason){
      this.fire('error', reason);
    }.bind(this));
  },

  /**
   * Read a file from the storage.
   *
   * Example:
   *  <chrome-app-filesystem id="appFilesystem" file="names.json" syncable="true"></chrome-app-filesystem>
   *
   *  this.$.appFilesystem.getFile().then(function(fileEntry){});
   *
   * @returns {Promise} The promise with {FileEntry} object.
   */
  getFile: function() {
    return new Promise(function(resolve, reject) {

      this._requestFilesystem()
        .then(function(fs) {
          fs.root.getFile(this.filename, {create: true}, function(fileEntry) {
            resolve(fileEntry);
          }, function(reason) {
            reject(reason);
          });

        }.bind(this))
        .catch(function(reason) {
          if (this.syncable && reason && reason.message && reason.message.indexOf("error code: -107") > 0) {
            //The user is not signed into the chrome.
            //Use local filesystem as a fallback.
            this.syncable = false;
            return this.getFile();
          }
          reject(reason);
        }.bind(this));

    }.bind(this));
  },


  /**
   * Read file contents.
   * This function will trigger "chrome-read" event with it's content.
   *
   * Example:
   *  <chrome-app-filesystem id="appFilesystem" file="names.json" syncable="true" auto="false" on-chrome-read="{{onFileRead}}"></chrome-app-filesystem>
   *
   *    this.$.appFilesystem.readFile();
   *  //...
   *  onFileRead: function(event, details, sender){
   *    //....
   *  }
   *
   * @returns {Promise} The promise with {FileEntry} object.
   */
  readFile: function(){
    this.getFile()
      .then(this._readFileContents)
      .then(function(result){
        var auto = this.auto;
        this.auto = false;
        this.content = result;
        this.async(function(){
          this.auto = auto;
        }.bind(this));
        this.fire('file-read', {content: result});
      }.bind(this))
      .catch(function(reason){
        this.fire('error', reason);
      }.bind(this));
  },

  _readFileContents: function(fileEntry){
    return new Promise(function(resolve, reject) {


      fileEntry.file(function(file) {

        var reader = new FileReader();
        reader.onloadend = function(e) {
          resolve(this.result);
        };
        reader.onerror = function(error) {
          reject(error);
        };
        reader.readAsText(file);
      }, function(error) {
        reject(error);
      });


    }.bind(this));
  },



  _requestFilesystem: function(){
    if(this.syncable){
      return this._requestSyncFS();
    }
    return this._requestLocalFS();
  },

  /**
   * Request a local filesystem.
   *
   * @returns {Promise} Promise will result with DOMFileSystem object.
   */
  _requestLocalFS: function(){
    return new Promise(function(resolve, reject) {

      var onInit = function(fs) {
        resolve(fs);
      };
      var onError = function(e) {
        reject(e);
      };

      navigator.webkitPersistentStorage.requestQuota(this.quota, function(grantedBytes) {
        this.grantedQuota = grantedBytes;
        window.requestFileSystem(window.PERSISTENT, grantedBytes, onInit, onError);
      }.bind(this), onError);

    }.bind(this));
  },
  /**
   * Returns a syncable filesystem backed by Google Drive.
   *
   * The returned DOMFileSystem instance can be operated on in the same
   * way as the Temporary and Persistant file systems
   * (see http://www.w3.org/TR/file-system-api/), except that
   * the filesystem object returned for Sync FileSystem does NOT support
   * directory operations (yet). You can get a list of file entries
   * by reading the root directory (by creating a new DirectoryReader),
   * but cannot create a new directory in it.
   *
   * Calling this multiple times from the same app will return the same
   * handle to the same file system.
   *
   * @returns {Promise} Promise will result with DOMFileSystem object.
   */
  _requestSyncFS: function(){
    return new Promise(function(resolve, reject) {
      chrome.syncFileSystem.requestFileSystem(function(fileSystem) {
        if (fileSystem === null) {
            //When a user is not signed into chrome
            reject(chrome.runtime.lastError);
            return;
        }
        resolve(fileSystem);
      });
    }.bind(this));
  },


  /**
   * Returns the current usage and quota in bytes for current filesystem.
   *
   * @returns {Promise} Promise will result filesystem status.
   * Object will contain folowwing keys:
   *  - usageBytes (integer)
   *  - quotaBytes (integer)
   */
  getUsageAndQuota: function(){
    if(this.syncable){
      return this._getUsageAndQuotaSync();
    }
    return this._getUsageAndQuotaLocal();
  },

  /**
   * Returns the current usage and quota in bytes for the local file storage for the app.
   *
   * @returns {Promise} Promise will result with local filesystem status.
   * Object will have folowwing keys:
   *  - usageBytes (integer)
   *  - quotaBytes (integer)
   */
  _getUsageAndQuotaLocal: function(){
    return new Promise(function(resolve, reject) {
      navigator.webkitPersistentStorage.queryUsageAndQuota(
        function(currentUsageInBytes, currentQuotaInBytes) {
          resolve({
            'usageBytes': currentUsageInBytes,
            'quotaBytes': currentQuotaInBytes
          });
        },
        function(e) {
          reject(e);
        }
      );
    }.bind(this));
  },

  /**
   * Returns the current usage and quota in bytes for the 'syncable' file storage for the app.
   *
   * @returns {Promise} Promise will result with 'syncable' filesystem status.
   * Object will have folowwing keys:
   *  - usageBytes (integer)
   *  - quotaBytes (integer)
   */
  _getUsageAndQuotaSync: function(){
    return new Promise(function(resolve, reject) {
      this._requestSyncFS()
      .then(function(fs){
        chrome.syncFileSystem.getUsageAndQuota(fs, function(info) {
          resolve(info);
        });
      })
      .catch(reject);
    }.bind(this));
  },

  _truncate: function(fileEntry){
    return new Promise(function(resolve, reject) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          resolve();
        };
        fileWriter.onerror = function(e) {
          reject(e);
        };
        fileWriter.truncate(0);
      }, reject);
    });
  },

  _writeFileEntry: function(fileEntry){
    return new Promise(function(resolve, reject) {

      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          resolve(fileEntry);
        };
        fileWriter.onerror = function(e) {
          reject(e);
        };

        var toWrite;
        if (typeof this.content === 'string') {
          toWrite = [this.content];
        } else {
          toWrite = this.content;
        }
        var blob = new Blob(toWrite, {type: this.mime});
        fileWriter.write(blob);
      }.bind(this), reject);


    }.bind(this));
  },

  /**
   * List files from root filesystem.
   * @TODO: add ability to read from any folder.
   */
  list: function(){

    var context = this;

    this._requestFilesystem()
    .then(function(fs) {

      var entries = [];
      var dirReader = fs.root.createReader();
      var readEntries = function() {
        dirReader.readEntries(function(results) {
          if (!results.length) {
            context.fire('directory-read', {files: entries.sort()});
          } else {
            entries = entries.concat(toArray(results));
            readEntries();
          }
        }, function(reason){
          context.fire('error', reason);
        });
      };

      readEntries();
    })
    .catch(function(reason) {
      if (context.syncable && reason && reason.message && reason.message.indexOf("error code: -107") > 0) {
        //The user is not signed into the chrome.
        //Use local filesystem as a fallback.
        context.fire('error', "You must be signed in to the Chrome to use syncable storage");
        return;
      }
      context.fire('error', reason);
    });
  },

  /**
   * Remove the file identified by the this.filename
   */
  remove: function(){
    if(!this.filename || this.filename == ''){
      this.fire('error', "Filename not present.");
      return;
    }

    var context = this;

    this.getFile()
    .then(function(fileEntry){

      fileEntry.remove(function() {
        context.fire('removed', {});
      }, function(reason){
        context.fire('error', reason);
      });

    })
    .catch(function(reason) {
      context.fire('error', reason);
    });
  }

});