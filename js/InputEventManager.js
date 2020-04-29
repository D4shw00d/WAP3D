/**
 * Objet responsable de gérer l'ensemble des interactions au clavier ou à la souris
 */
class IEM {
  /**  */
  constructor(player, cameraControls) {
    this.player = player
    this.cameraControls = cameraControls
    this.playerAnimating = true
    this.currentlySelectedElements = new Set()
    this.isOnAppendSelectionMode = false
  }

  /** Fonction appellée pour ouvrir la div de sélection d'élements */
  _openObjectListAction() {

    $("#closeOpenButton img").attr("src", "./images/close_button.svg")

    $("#objectSelector").animate({ width: '30%', height: '100%', top: '0' }, {
      duration: 100,
      complete: _ =>{
        $("#closeOpenButton").one("click", event => this.closeObjectListAction(event))
        $("#closeOpenButton").css({"width": "1.5vw", "height": "3vh", "top": "50%"})
      } 
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeIn(100)

    $("#messagePlayer").animate({ width: '59%' }, {
      duration: 100,
    })
  }

  /** Fonction appellée pour minimiser la div de sélection d'élements */
  closeObjectListAction() {

    $("#closeOpenButton img").attr("src", "./images/open_button.svg")

    $("#objectSelector").animate({ width: '1.5%', height: '5%', top: '47.5%'}, {
      duration: 100,
      complete: _ => {
        $("#closeOpenButton").one("click", event => this._openObjectListAction(event))
        $("#closeOpenButton").css({"width": "100%", "height": "100%", "top": "0"})
      }
    })

    $("#objectSelector").children().not("#closeOpenButton").fadeOut(100)

    $("#messagePlayer").animate({ width: '84%' }, {
      duration: 100,
    })
  }

  /** 
   * @param {*} keyEvent La touche pressée
   */
  keydownAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
      case "Z":
      case "Q":
      case "S":
      case "D":
        // Déjà utiliser par le déplacement de la caméra
        break
      case 'R':
        this.player.referenceAxis.visible = !this.player.referenceAxis.visible
        break
      case " ":
        this.clickOnGlobalPlayPauseAction()
        break
      case "SHIFT":
        //player
        this.cameraControls.screenSpacePanning = true
        this.cameraControls.keys.UP = 90 // Z
        this.cameraControls.keys.BOTTOM = 83 // S
        break
      case "CONTROL":
        //selection ctrl avancés
        this.isOnAppendSelectionMode = true
        break
      case 'ENTER':
        if (this.currentlySelectedElements.size > 0) this.openAdvancedControls(this.currentlySelectedElements)
        break
      case 'DELETE':
        this.player.deleteObjectsFromPlayer(this.currentlySelectedElements)
        break

    }
  }

  /**
   *  @param {*} keyEvent La touche relachée
   */
  keyupAction(keyEvent) {
    let keyPressed = keyEvent.originalEvent.key.toUpperCase()
    switch (keyPressed) {
      case "Z":
      case "Q":
      case "S":
      case "D":
        // Déjà utiliser par le déplacement de la caméra
        break
      case "SHIFT":
        this.cameraControls.screenSpacePanning = false
        this.cameraControls.keys.UP = 90 // Z
        this.cameraControls.keys.BOTTOM = 83 // S
        break
      case "CONTROL":
        //selection ctrls avancés
        this.isOnAppendSelectionMode = false
        break
    }
  }

  /** Demande au Player de toggle entre pause et play */
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    this.playerAnimating = this.player.toggleAnimation()
  }

  /** Demande au player de mettre toutes les animations à leur première frames */
  //TODO à modifier pour être utilisé dans les listes
  clickOnGlobalReplayAction(event) {
    if (this.iemIsBlocked) return
    this.player.bvhAnimationsArray.setAllBvhTime(0)
    this.player.restartAnimation()
  }

  /** Demande au player de mettre en route tout les BVH */
  clickOnBVHListPlayAction(event) {
    if (this.iemIsBlocked) return
    this.player.playBVHAnimation()
  }

  /** Demande au player de mettre en pause tout les BVH */
  clickOnBVHListPauseAction(event) {
    if (this.iemIsBlocked) return
    this.player.pauseBVHAnimation()
  }

  /** Demande au player de relancer tout les BVH */
  clickOnBVHListReplayAction(event) {
    if (this.iemIsBlocked) return
    this.player.restartBVHAnimation(false)
  }

  /** Demande au player de toggle la visibilité de tout les BVH */
  toggleBVHListVisibilityCheckboxAction(event) {
    if (this.iemIsBlocked) return
    let isChecked = $(event.target).is(":checked")
    this.player.toggleBVHVisibility(isChecked)
    $("#bvhList .list .object .controlFunctions .display").prop('checked', isChecked)
  }

  /** Demande au player de mettre en pause l'animation correspondante à l'élément dans lequel le bouton pause à été clické */
  clickOnPlayPauseAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.toggleObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la première frame l'animation correspondante à l'élément dans lequel le bouton replay à été clické */
  clickOnReplayAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.parentNode.id
    this.player.replayObjectInListAnimation(objectId)
  }

  /** Demande au player de mettre à la frame correspondante l'animation correspondante à l'élément dans lequel le time slider à été clické */
  modifyTimeSliderAction(event) {
    if (this.iemIsBlocked) return
    let newValue = event.currentTarget.valueAsNumber
    let objectId = event.target.parentNode.parentNode.id
    this.player.modifyObjectInListTimeSlider(objectId, newValue)
  }

  /** Demande au player de toggle la visibilité de l'élément correspondant */
  toggleVisibilityCheckboxAction(event) {
    if (this.iemIsBlocked) return
    let objectId = event.target.parentNode.parentNode.id
    this.player.toggleObjectInListVisibility(objectId, $(event.target).is(":checked"))
  }

  /** TODO */
  modifyWindowSizeAction() {
    if (this.iemIsBlocked) return
    this.player.updateRendererSize()
  }

  /** Demande au player de rajouter des éléments à la liste des éléments modifiable par la fenêtre de ctrl avancés
   * 
   *  @param {event} event
   */
  selectElementFromListAction(event) {
    let target = event.target
    let object = undefined
    if (target.tagName === "P") {
      object = target.parentNode.parentNode
    } else if (target.className === "titleArea") {
      object = target.parentNode
    }
    $(object).css("background-color", "darkgrey")

    if (typeof object === "undefined") { return }

    if (this.isOnAppendSelectionMode) {
      $("#" + object.id).css("background-color", "darkgrey")
      this.currentlySelectedElements.add(object.id)
    } else {
      this.currentlySelectedElements.forEach((uuid) => {
        $("#" + uuid).css("background-color", "white")
      })
      if (!this.currentlySelectedElements.has(object.id)) {
        this.currentlySelectedElements.clear()
        $("#" + object.id).css("background-color", "darkgrey")
        this.currentlySelectedElements.add(object.id)
      } else {
        this.currentlySelectedElements.clear()
      }
    }
    this.player.bvhAnimationsArray.highlightElements(this.currentlySelectedElements)
  }


  /** Demande au player de lancer la fenêtre de contrôles avancés normalement appelé pour un "enter" ou un "dblClick"
   * 
   * @param {event} event
   */
  openAdvancedControlsAction(event) {
    let target = event.target
    if (target.tagName === "P") {
      $(target.parentNode.parentNode).css("background-color", "darkgrey")
      this.player.launchAdvancedControls([target.parentNode.parentNode.id])
    } else if (target.className === "titleArea" || target.className === "controlFunctions") {
      $(target.parentNode).css("background-color", "darkgrey")
      this.player.launchAdvancedControls([target.parentNode.id])
    }
  }

  /** Demande au player de lancer la fenêtre de contrôles avancés normalement appelé pour un "enter" ou un "dblClick"
   * 
   */
  openAdvancedControls() {
    this.player.launchAdvancedControls(this.currentlySelectedElements)
  }

  /** TODO */
  fileSelectedAction(event) {
    let objectType = event.target.accept.lastOf('\.')
    this.iemIsBlocked = true
    this.player.loadFile(event, objectType).then(
      this.iemIsBlocked = false
    )
  }
}