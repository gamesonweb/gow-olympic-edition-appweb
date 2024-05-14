import "@babylonjs/loaders"
function CreateGround(scene,BABYLON){
    const { Vector3,Color3, Texture, MeshBuilder, StandardMaterial } = BABYLON
    const ground= MeshBuilder.CreateGround("ground",{ width: 50, height: 50}, scene)

    const groundMat = new StandardMaterial("groundMat",scene)
    const diffuseTex = new Texture("./textures/groundTexDiffuse.jpg",scene)
    const normalTex = new Texture("./textures/groundTexNormal.jpg",scene)
    groundMat.diffuseTexture = diffuseTex
    groundMat.normalTexture = normalTex

    diffuseTex.uScale = 10
    diffuseTex.vScale = 10
    normalTex.uScale = 10
    normalTex.vScale = 10
    groundMat.specularColor = new Color3(0,0,0)

    ground.material = groundMat

}


async function gameScene(BABYLON,engine,currentScene){
    const {Vector3,SceneLoader,Scene,MeshBuilder,StandardMaterial,FreeCamera,HemisphericLight} = BABYLON
    let isMoving= false
    let characterSpeed=4
    
    const scene= new Scene(engine)
    const cam= new FreeCamera("camera",new Vector3(0,0,-5),scene)
    cam.attachControl()

    const light = new HemisphericLight("lightsa",new Vector3(0,10,0), scene)
    const Model = await SceneLoader.ImportMeshAsync("","./models/","untitled.glb", scene)
    const anims = Model.animationGroups
    const meshes = Model.meshes
    const rootMesh = meshes[0]
    const characterBox = MeshBuilder.CreateBox("characterBox",{size: 1, height: 2},scene)
    rootMesh.parent = characterBox
    characterBox.visibility = .5
    rootMesh.position.y = -1
    characterBox.position.y+= 1 
    anims.forEach(anim=> anim.name ==="idle" && anim.play(true))
    CreateGround(scene,BABYLON)
    
    const cameraContainer = MeshBuilder.CreateGround("ground",{width: .5, height: .5}, scene)
    cameraContainer.position = new Vector3(0,15,0)
    cam.parent = cameraContainer
    cam.setTarget(new Vector3(0,-10,0))

    let camVertical = 0
    let camHorizontal = 0
    let camSpd = 3
    window.addEventListener("keydown", e => {
        const theKey = e.key.toLowerCase()

        if(theKey === "arrowup") camVertical = 1
        if(theKey === "arrowdown") camVertical = -1
        if(theKey === "arrowleft") camHorizontal = -1
        if(theKey === "arrowright") camHorizontal = 1

        
    })
    window.addEventListener("keyup", e => {
        const theKey = e.key.toLowerCase()

        if(theKey === "arrowup") camVertical = 0
        if(theKey === "arrowdown") camVertical = 0
        if(theKey === "arrowleft") camHorizontal = 0
        if(theKey === "arrowright") camHorizontal = 0

    })

        scene.onPointerDown = e => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY)

    if(e.buttons ===1){
        const pickInfo = scene.pick(scene.pointerX,scene.pointerY)
        if(pickInfo.pickedMesh.name === "ground"){
            Move(pickInfo.pickedPoint)
        }
    }    
    
    
}
function Move(directionPos){
    isMoving=true
    const {x,z} =directionPos
    characterBox.lookAt(new Vector3(x,characterBox.position.y,z), 0,0,0)
    anims.forEach(anim=> anim.name === "running" && anim.play(true))
}


    scene.registerAfterRender(() => {
        const deltaTime = engine.getDeltaTime()/1000
        cameraContainer.locallyTranslate(new Vector3(camHorizontal*camSpd*engine.getDeltaTime()/1000,0,camVertical*camSpd*engine.getDeltaTime()/1000))
        if(isMoving) characterBox.locallyTranslate(new Vector3(0,0,characterSpeed* deltaTime))
    })
    await scene.whenReadyAsync()
    currentScene.dispose()
    return scene
    
}
export default gameScene