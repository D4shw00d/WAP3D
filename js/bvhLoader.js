//scene, renderer et camera sont défini dans WAP3D.js
//framerateTimeReference et currentScreenFrameTime sont défini dans WAP3D.js
//updateFrameTime() et initialisePlayer() sont défini dans WAP3D.js

let bvhFilesloadingState = false
let progressBar = $('<div id="progressBar" hidden></div>')
progressBar.append('<div id="progressValue"></div>')
progressBar.append('<div id="currProgress"></div>')


/**
 * Sélectionne, associe et lance un bvh dans le lecteur
 */
function associateBVH(filesToLoad, scene, bvhAnimationsArray) {
    let files = filesToLoad.currentTarget.files; // Le this désigne le contexte courant !
    bvhFilesloadingState = "loading"
    let nbFileToLoad = files.length
    if (nbFileToLoad === 0) {
        console.info('No file is selected');
    } else {
        console.info('Start loading ', nbFileToLoad, ' files');
        $("#messagePlayer").text("Chargement en cours : " + nbFileToLoad + " fichiers.")
        let reader = new FileReader();

        reader.onload = function(event) {
            let bvhFile = new BVHParser(event.target.result)
            let animation = bvhFile.getAnimation()

            // nouvelle mesh pour représenter le squelette
            let geometry = new THREE.BufferGeometry();
            let material = new THREE.MeshPhongMaterial({ skinning: true });
            let mesh = new THREE.SkinnedMesh(geometry, material);

            // bind du squelette
            mesh.add(animation.skeleton.bones[0]);
            mesh.bind(animation.skeleton);

            mesh.scale.x = bvhFile.getSizeFactor()
            mesh.scale.y = bvhFile.getSizeFactor()
            mesh.scale.z = bvhFile.getSizeFactor()

            console.debug(mesh.scale)

            // figure finale
            let skeletonHelper = new THREE.SkeletonHelper(mesh);
            skeletonHelper.material.linewidth = 2;

            scene.add(skeletonHelper);
            scene.add(mesh);

            //permet de gérer les timings d'animations asynchrones entre eux et avec le framerate
            let mixer = new THREE.AnimationMixer(mesh);
            mixer.clipAction(animation.clip).play()

            bvhAnimationsArray.push([skeletonHelper, mixer, bvhFile.getFrameTime()])
        };

        let fileIndex = 0
        let controlDiv = $("#control")
        let loadingPercentage = "0%"
        let waitForDoneInterval = setInterval(function() {
            if (reader.readyState === 2 || reader.readyState === 0) {
                console.debug('Loading file : ', fileIndex);

                // Barre de chargement
                $("#control").replaceWith(progressBar.show())
                loadingPercentage = parseInt((fileIndex * 100) / nbFileToLoad, 10) + "%"
                $("#currProgress")[0].style.width = loadingPercentage
                $("#progressValue").text(loadingPercentage)

                reader.readAsText(files[fileIndex]); // Async
                fileIndex += 1
                if (fileIndex === nbFileToLoad) {
                    $("#progressBar").replaceWith(controlDiv)
                    clearInterval(waitForDoneInterval)
                    bvhFilesloadingState = "loaded"
                    fileLoadedCallBack()
                }
            }
        }, 5);
    }
}

/** TODO */
function getLoadingState() {
    return bvhFilesloadingState
}