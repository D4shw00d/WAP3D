class FileLoader {
  constructor(scene, animationsArray) {
    this.loadingState = false
    this.scene = scene
    this.animations = animationsArray
    this.nbFileToLoad = 0
    this.totalNbLoadedFiles = 0
    this.oldNbLoadedFiles = 0
    this.progressBar = $('<div id="progressBar"></div>')
    this.progressBar.append('<div id="progressValue"></div>')
    this.progressBar.append('<div id="currProgress"></div>')
  }

  /**  */
  loadNewFiles(files) {
    return new Promise(async(resolve, reject) => {
      try {
        this.loadingState = "loading"
        $("#messagePlayer").text("Chargement en cours : " + this.nbFileToLoad + " fichiers.")

        this.oldNbLoadedFiles = this.nbLoadedFiles // sauvegarde du nombre de ficheir déjà chargé

        // Barre de chargement
        this._savePlayerContext()
        $("#control").replaceWith(this.progressBar)
        this._updateProgressBar(0)

        await this._load(files)

        this._restorePlayerContext()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /** Fonction Abstraite (Promesse)
   *  Retourne une liste de promesses correspondant à l'ensemble des chargements de fichiers entrés en paramètre
   * 
   *  @param files la liste des fichiers à charger
   * 
   *  @returns une liste de promesse
   *    - resolue lorsque l'ensemble des promesses de la liste sont resolues
   *    - rejetée lorsqu'une des promesse de la liste est rejeté
   */
  _load(files) { /** Abstrait */
    return new Promise((resolve, reject) => reject(new Error("this.load Abstract : not Implemented")))
  }

  /** Sauvegarde le contexte courrant de la div "control" du player */
  _savePlayerContext() {
    this.controlDiv = $("#control")
  }

  /** Restaure le contexte du player sauvegarder au début du chargment de fichier (voir _savePlayerContext) */
  _restorePlayerContext() {
    $("#progressBar").replaceWith(this.controlDiv)
    this.loadingState = "loaded"
  }

  /** Met a jour l'affichage de la barre de progression a partir du poucentage entre en parametre
   * 
   * @param loadingPercentage nouvelle valeur de progression (en %)
   */
  _updateProgressBar(loadingPercentage) {
    loadingPercentage = parseInt(((this.nbLoadedFiles - this.oldNbLoadedFiles) * 100) / this.nbFileToLoad, 10) + "%"
    $("#currProgress")[0].style.width = loadingPercentage
    $("#progressValue").text(loadingPercentage)
  }

  /** Retourne le nombre total dede fichier (bvh) chargé depuis le debut */
  get nbLoadedFiles() {
    return this.totalNbLoadedFiles
  }

  /**  */
  set nbLoadedFiles(value) {
    this.totalNbLoadedFiles = value
    this._updateProgressBar(value)
    if (console.DEBUG_MODE) {
      console.clear()
      this.bvhAnimations.forEach(console.debug)
    }
  }

  /** Retourne l'état actuel du chargment (false, loading, loaded) */
  get loadingState() {
    return this.bvhFilesloadingState
  }

  /**  */
  set loadingState(state) {
    this.bvhFilesloadingState = state
  }
}