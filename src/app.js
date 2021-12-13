const planck = require('planck/dist/planck-with-testbed');
const IS_BODY_STATIC = true;

const BODY_PART_WIDTH = 0.5;
const BODY_PART_HEIGHT = 5;
const FIXTURE_FD = {
    density: 0.1,
    friction: 0.0
};
const BODY_TYPE = 'dynamic';
//TODO: Clean up and add websockets

if (module.hot) {
    module.hot.accept();
}

function setRevoluteJointAngle(joint, angleTarget, gain = 0.1) {
    let angleError = joint.getJointAngle() - angleTarget;
    joint.setMotorSpeed(-gain * angleError);
}


planck.testbed(function (testbed) {
    testbed.info('Use arrow keys to move player');
    var pl = planck, Vec2 = pl.Vec2;
    var world = new pl.World({
        gravity: Vec2(0, 0),
        allowSleep: true,
    });
    testbed.speed = 5.0;
    testbed.hz = 50;
    var ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(100.0, -10.0), Vec2(-100.0, -10.0)));

    var plankA1 = world.createBody({ position: Vec2(0.0, 0.0), type: BODY_TYPE });
    plankA1.createFixture(pl.Box(BODY_PART_WIDTH, BODY_PART_HEIGHT), FIXTURE_FD);

    var plankA2 = world.createBody({ position: Vec2(0.0, 9.0), type: BODY_TYPE });
    plankA2.createFixture(pl.Box(BODY_PART_WIDTH, BODY_PART_HEIGHT), FIXTURE_FD);

    var plankA3 = world.createBody({ position: Vec2(0.0, 18.0), type: BODY_TYPE });
    plankA3.createFixture(pl.Box(BODY_PART_WIDTH, BODY_PART_HEIGHT), FIXTURE_FD);

    var plankA4 = world.createBody({ position: Vec2(0.0, 27.0), type: BODY_TYPE });
    plankA4.createFixture(pl.Box(BODY_PART_WIDTH, BODY_PART_HEIGHT), FIXTURE_FD);

    var plankA5 = world.createBody({ position: Vec2(0.0, 36.0), type: BODY_TYPE });
    plankA5.createFixture(pl.Box(BODY_PART_WIDTH, BODY_PART_HEIGHT), FIXTURE_FD);

    var jd = {};
    jd.enableMotor = true;
    jd.maxMotorTorque = 1000.0;
    jd.enableLimit = false;
    jd.motorSpeed = 0.0;

    var jointA1 = pl.RevoluteJoint(jd, plankA1, plankA2, Vec2(0.0, 4));
    var jointA2 = pl.RevoluteJoint(jd, plankA2, plankA3, Vec2(0.0, 13));
    var jointA3 = pl.RevoluteJoint(jd, plankA3, plankA4, Vec2(0.0, 22));
    var jointA4 = pl.RevoluteJoint(jd, plankA4, plankA5, Vec2(0.0, 31));

    world.createJoint(jointA1);
    world.createJoint(jointA2);
    world.createJoint(jointA3);
    world.createJoint(jointA4);

    world.createJoint(pl.WeldJoint({}, plankA1, ground, Vec2(0.0, 20.0)));

    testbed.step = function () {

        setRevoluteJointAngle(jointA1, 0.25 * Math.PI);
        setRevoluteJointAngle(jointA2, 0.25 * Math.PI);
        setRevoluteJointAngle(jointA3, 0.25 * Math.PI);
        setRevoluteJointAngle(jointA4, 0.25 * Math.PI);


        testbed.info('Angle Gyro 1', jointA1.getJointAngle());
        testbed.info('Angle Gyro 2', jointA2.getJointAngle());
        testbed.info('Angle Gyro 3', jointA3.getJointAngle());
        testbed.info('Angle Gyro 4', jointA4.getJointAngle());
    }


    return world;
});