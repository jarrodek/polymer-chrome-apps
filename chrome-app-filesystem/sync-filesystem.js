
Polymer('sync-filesystem', {
  /**
   * Fired when a filesystem is ready.
   *
   * @event chrome-filesystem
   */
  /**
   * Fired when requesting filesystem usage info.
   * @event chrome-filesystem-usage
   */
  /**
   * Fired when an error is received.
   *
   * @event chrome-error
   */


  /**
   * Request a syncable filesystem.
   */
  requestFilesystem: function(){

    this._requestSyncFS()
      then(function(fileSystem){
        this.fire('chrome-filesystem', {
          'filesystem': fileSystem
        });
      }.bind(this))
      .catch(function(reason){
        this.fire('chrome-error', {
          'messager': reason
        });
      }.bind(this));
  },

  /**
   * Request a syncable filesystem backed by Google Drive.
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
   * Returns the current usage and quota in bytes for the 'syncable' file storage for the app.
   *
   * @returns {Promise} Promise will result with 'syncable' filesystem status.
   * Object will have folowwing keys:
   *  - usageBytes (integer)
   *  - quotaBytes (integer)
   */
  getUsageAndQuota: function(){
    this._requestSyncFS()
    .then(function(fs){
      chrome.syncFileSystem.getUsageAndQuota(fs, function(info) {
        this.fire('chrome-filesystem-usage', {
          'usageInfo': info
        });
      });
    })
    .catch(function(reason){
      this.fire('chrome-error', {
        'message': reason
      });
    }.bind(this));
  }

});