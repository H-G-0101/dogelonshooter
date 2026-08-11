gdjs.TitleCode = {};
gdjs.TitleCode.localVariables = [];
gdjs.TitleCode.idToCallbackMap = new Map();
gdjs.TitleCode.GDTitleObjects1= [];
gdjs.TitleCode.GDTitleObjects2= [];
gdjs.TitleCode.GDBackgroundObjects1= [];
gdjs.TitleCode.GDBackgroundObjects2= [];
gdjs.TitleCode.GDBackground2Objects1= [];
gdjs.TitleCode.GDBackground2Objects2= [];
gdjs.TitleCode.GDQuitGame_9595ButtonObjects1= [];
gdjs.TitleCode.GDQuitGame_9595ButtonObjects2= [];
gdjs.TitleCode.GDStartGame_9595ButtonObjects1= [];
gdjs.TitleCode.GDStartGame_9595ButtonObjects2= [];
gdjs.TitleCode.GDNewSpriteObjects1= [];
gdjs.TitleCode.GDNewSpriteObjects2= [];
gdjs.TitleCode.GDNewSprite2Objects1= [];
gdjs.TitleCode.GDNewSprite2Objects2= [];


gdjs.TitleCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Background"), gdjs.TitleCode.GDBackgroundObjects1);
{gdjs.evtTools.camera.setCameraZoom(runtimeScene, 4, "Background", 0);
}
{gdjs.evtTools.camera.centerCamera(runtimeScene, (gdjs.TitleCode.GDBackgroundObjects1.length !== 0 ? gdjs.TitleCode.GDBackgroundObjects1[0] : null), true, "Background", 0);
}
{gdjs.evtTools.runtimeScene.setBackgroundColor(runtimeScene, "21;17;35");
}
}

}


};gdjs.TitleCode.eventsList1 = function(runtimeScene) {

{


gdjs.TitleCode.eventsList0(runtimeScene);
}


{

gdjs.copyArray(runtimeScene.getObjects("StartGame_Button"), gdjs.TitleCode.GDStartGame_9595ButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.TitleCode.GDStartGame_9595ButtonObjects1.length;i<l;++i) {
    if ( gdjs.TitleCode.GDStartGame_9595ButtonObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.TitleCode.GDStartGame_9595ButtonObjects1[k] = gdjs.TitleCode.GDStartGame_9595ButtonObjects1[i];
        ++k;
    }
}
gdjs.TitleCode.GDStartGame_9595ButtonObjects1.length = k;
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "GameScene", false);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("QuitGame_Button"), gdjs.TitleCode.GDQuitGame_9595ButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.TitleCode.GDQuitGame_9595ButtonObjects1.length;i<l;++i) {
    if ( gdjs.TitleCode.GDQuitGame_9595ButtonObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.TitleCode.GDQuitGame_9595ButtonObjects1[k] = gdjs.TitleCode.GDQuitGame_9595ButtonObjects1[i];
        ++k;
    }
}
gdjs.TitleCode.GDQuitGame_9595ButtonObjects1.length = k;
if (isConditionTrue_0) {
{if (typeof window !== "undefined" && window.__openControls) { window.__openControls(); }
}
}

}


};

gdjs.TitleCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.TitleCode.GDTitleObjects1.length = 0;
gdjs.TitleCode.GDTitleObjects2.length = 0;
gdjs.TitleCode.GDBackgroundObjects1.length = 0;
gdjs.TitleCode.GDBackgroundObjects2.length = 0;
gdjs.TitleCode.GDBackground2Objects1.length = 0;
gdjs.TitleCode.GDBackground2Objects2.length = 0;
gdjs.TitleCode.GDQuitGame_9595ButtonObjects1.length = 0;
gdjs.TitleCode.GDQuitGame_9595ButtonObjects2.length = 0;
gdjs.TitleCode.GDStartGame_9595ButtonObjects1.length = 0;
gdjs.TitleCode.GDStartGame_9595ButtonObjects2.length = 0;
gdjs.TitleCode.GDNewSpriteObjects1.length = 0;
gdjs.TitleCode.GDNewSpriteObjects2.length = 0;
gdjs.TitleCode.GDNewSprite2Objects1.length = 0;
gdjs.TitleCode.GDNewSprite2Objects2.length = 0;

gdjs.TitleCode.eventsList1(runtimeScene);
gdjs.TitleCode.GDTitleObjects1.length = 0;
gdjs.TitleCode.GDTitleObjects2.length = 0;
gdjs.TitleCode.GDBackgroundObjects1.length = 0;
gdjs.TitleCode.GDBackgroundObjects2.length = 0;
gdjs.TitleCode.GDBackground2Objects1.length = 0;
gdjs.TitleCode.GDBackground2Objects2.length = 0;
gdjs.TitleCode.GDQuitGame_9595ButtonObjects1.length = 0;
gdjs.TitleCode.GDQuitGame_9595ButtonObjects2.length = 0;
gdjs.TitleCode.GDStartGame_9595ButtonObjects1.length = 0;
gdjs.TitleCode.GDStartGame_9595ButtonObjects2.length = 0;
gdjs.TitleCode.GDNewSpriteObjects1.length = 0;
gdjs.TitleCode.GDNewSpriteObjects2.length = 0;
gdjs.TitleCode.GDNewSprite2Objects1.length = 0;
gdjs.TitleCode.GDNewSprite2Objects2.length = 0;


return;

}

gdjs['TitleCode'] = gdjs.TitleCode;
