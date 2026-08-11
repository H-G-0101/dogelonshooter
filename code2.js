gdjs.GameOverCode = {};
gdjs.GameOverCode.localVariables = [];
gdjs.GameOverCode.idToCallbackMap = new Map();
gdjs.GameOverCode.GDDeathObjects1= [];
gdjs.GameOverCode.GDDeathObjects2= [];
gdjs.GameOverCode.GDDeathParticleObjects1= [];
gdjs.GameOverCode.GDDeathParticleObjects2= [];
gdjs.GameOverCode.GDGameOverObjects1= [];
gdjs.GameOverCode.GDGameOverObjects2= [];
gdjs.GameOverCode.GDBackground2Objects1= [];
gdjs.GameOverCode.GDBackground2Objects2= [];
gdjs.GameOverCode.GDStartGame_9595ButtonObjects1= [];
gdjs.GameOverCode.GDStartGame_9595ButtonObjects2= [];
gdjs.GameOverCode.GDmorteObjects1= [];
gdjs.GameOverCode.GDmorteObjects2= [];


gdjs.GameOverCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Background2"), gdjs.GameOverCode.GDBackground2Objects1);
gdjs.copyArray(runtimeScene.getObjects("Death"), gdjs.GameOverCode.GDDeathObjects1);
gdjs.copyArray(runtimeScene.getObjects("GameOver"), gdjs.GameOverCode.GDGameOverObjects1);
{for(var i = 0, len = gdjs.GameOverCode.GDDeathObjects1.length ;i < len;++i) {
    gdjs.GameOverCode.GDDeathObjects1[i].getBehavior("ShakeObject_PositionAngle").ShakeObject_PositionAngle(0, 150, 150, 0, 5, true, null);
}
}
{for(var i = 0, len = gdjs.GameOverCode.GDGameOverObjects1.length ;i < len;++i) {
    gdjs.GameOverCode.GDGameOverObjects1[i].getBehavior("ShakeObject_PositionAngle").ShakeObject_PositionAngle(0, 0, 20, 2, 5, true, null);
}
}
{gdjs.evtTools.camera.setCameraZoom(runtimeScene, 3, "Background", 0);
}
{gdjs.evtTools.camera.centerCamera(runtimeScene, (gdjs.GameOverCode.GDBackground2Objects1.length !== 0 ? gdjs.GameOverCode.GDBackground2Objects1[0] : null), true, "Background", 0);
}
{gdjs.evtTools.camera.setCameraX(runtimeScene, (( gdjs.GameOverCode.GDBackground2Objects1.length === 0 ) ? 0 :gdjs.GameOverCode.GDBackground2Objects1[0].getAABBRight()), "Background", 0);
}
{gdjs.evtTools.sound.playSound(runtimeScene, "GameOver", false, runtimeScene.getGame().getVariables().getFromIndex(0).getChild("Volume").getAsNumber(), 1);
}
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("Background2"), gdjs.GameOverCode.GDBackground2Objects1);
gdjs.copyArray(runtimeScene.getObjects("Death"), gdjs.GameOverCode.GDDeathObjects1);
gdjs.copyArray(runtimeScene.getObjects("DeathParticle"), gdjs.GameOverCode.GDDeathParticleObjects1);
{for(var i = 0, len = gdjs.GameOverCode.GDDeathParticleObjects1.length ;i < len;++i) {
    gdjs.GameOverCode.GDDeathParticleObjects1[i].setPosition((( gdjs.GameOverCode.GDDeathObjects1.length === 0 ) ? 0 :gdjs.GameOverCode.GDDeathObjects1[0].getCenterXInScene()),(( gdjs.GameOverCode.GDDeathObjects1.length === 0 ) ? 0 :gdjs.GameOverCode.GDDeathObjects1[0].getCenterYInScene()));
}
}
{for(var i = 0, len = gdjs.GameOverCode.GDBackground2Objects1.length ;i < len;++i) {
    gdjs.GameOverCode.GDBackground2Objects1[i].setXOffset(gdjs.GameOverCode.GDBackground2Objects1[i].getXOffset() + (1.5));
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("StartGame_Button"), gdjs.GameOverCode.GDStartGame_9595ButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.GameOverCode.GDStartGame_9595ButtonObjects1.length;i<l;++i) {
    if ( gdjs.GameOverCode.GDStartGame_9595ButtonObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.GameOverCode.GDStartGame_9595ButtonObjects1[k] = gdjs.GameOverCode.GDStartGame_9595ButtonObjects1[i];
        ++k;
    }
}
gdjs.GameOverCode.GDStartGame_9595ButtonObjects1.length = k;
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "GameScene", false);
}
}

}


};

gdjs.GameOverCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.GameOverCode.GDDeathObjects1.length = 0;
gdjs.GameOverCode.GDDeathObjects2.length = 0;
gdjs.GameOverCode.GDDeathParticleObjects1.length = 0;
gdjs.GameOverCode.GDDeathParticleObjects2.length = 0;
gdjs.GameOverCode.GDGameOverObjects1.length = 0;
gdjs.GameOverCode.GDGameOverObjects2.length = 0;
gdjs.GameOverCode.GDBackground2Objects1.length = 0;
gdjs.GameOverCode.GDBackground2Objects2.length = 0;
gdjs.GameOverCode.GDStartGame_9595ButtonObjects1.length = 0;
gdjs.GameOverCode.GDStartGame_9595ButtonObjects2.length = 0;
gdjs.GameOverCode.GDmorteObjects1.length = 0;
gdjs.GameOverCode.GDmorteObjects2.length = 0;

gdjs.GameOverCode.eventsList0(runtimeScene);
gdjs.GameOverCode.GDDeathObjects1.length = 0;
gdjs.GameOverCode.GDDeathObjects2.length = 0;
gdjs.GameOverCode.GDDeathParticleObjects1.length = 0;
gdjs.GameOverCode.GDDeathParticleObjects2.length = 0;
gdjs.GameOverCode.GDGameOverObjects1.length = 0;
gdjs.GameOverCode.GDGameOverObjects2.length = 0;
gdjs.GameOverCode.GDBackground2Objects1.length = 0;
gdjs.GameOverCode.GDBackground2Objects2.length = 0;
gdjs.GameOverCode.GDStartGame_9595ButtonObjects1.length = 0;
gdjs.GameOverCode.GDStartGame_9595ButtonObjects2.length = 0;
gdjs.GameOverCode.GDmorteObjects1.length = 0;
gdjs.GameOverCode.GDmorteObjects2.length = 0;


return;

}

gdjs['GameOverCode'] = gdjs.GameOverCode;
