import * as THREE from '../three.module.js';

class App {
    constructor() {
        const divContainer = document.querySelector(".yachtCanvas");
        this._divContainer = divContainer; // field화 시켰다, 다른 method에서 참조할 수 있도록 하기 위해서 this._divContaner로 정의함.

        // renderer객체에 antialias를 활성화 시켜주면, 3차원 장면이 렌더링될 때 object 경계선이 계단 현상 없이 부드럽게 표현된다.
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        // setPixelRatio : pixel에 ratio값을 설정한다. window.devicePixelRatio 속성으로 그 값을 쉽게 얻을 수 있다. (디스플레이 크기 항목 값)
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.domElement : canvas타입의 dom 객체이다.
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();

        // onresize : 창 크기가 변경되면 발생하는 이벤트
        // resize 이벤트가 필요한 이유 ? renderer나 camera는 창 크기가 변경될 때마다 그 크기에 맞게 속성 값을 재설정해줘야 한다.
        // bind를 사용하는 이유 ? resize method 안에서 this가 가르키는 객체가 이벤트 객체가 아닌, App클래스의 객체가 되도록 하기 위해서이다.
        window.onresize = this.resize.bind(this);
        // 위의 onresize와는 상관없이 무조건적으로 App클래스 내부에서 한 번 호출하는 이유는, renderer나 camera의 창 크기에 맞게 설정해주기 위함이다.
        this.resize();

        // render method는 3차원 그래픽 장면을 만들어준다,
        // requestAnimationFrame : 적당한 시점에 또는, 최대한 빠르게 render method를 호출한다.
        requestAnimationFrame(this.render.bind(this));
    }

    _setupCamera() {
        // three.js가 3차원 그래픽을 출력할 영역에 대한 가로와 세로의 크기
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        // 위의 크기들을 이용해서 camera 객체 생성
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.z = 2;
        this._camera = camera;
    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 1;
        // 광원을 생성하기 위해서는, 광원의 색상과 세기 값이 필요하다.
        const light = new THREE.DirectionalLight(color, intensity);
        // 광원의 위치 설정
        light.position.set(-1, 2, 4);
        // 생성한 광원을 scene 객체의 구성 요소로 추가한다.
        this._scene.add(light);
    }

    // 파란색의 정육면체 mesh를 생성
    _setupModel() {
        // 정육면체에 대한 형상을 정의하기 위하여, BoxGeometry클래스를 이용해, geometry 객체를 생성.
        const geometry = new THREE.BoxGeometry(1, 1, 1); // (가로, 세로, 깊이)
        // 파란색 계열의 재질을 생성
        const material = new THREE.MeshPhongMaterial({ color: 0x44a88 });

        // 정육면체 mesh
        const cube = new THREE.Mesh(geometry, material);

        this._scene.add(cube);
        this._cube = cube;
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        // camera의 속성 값 설정
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        // renderer의 크기 설정
        this._renderer.setSize(width, height);
    }

    // time: 렌더링이 처음 시작된 이후, 경과된 시간 값으로 단위가 milli-second이다.
    // time인자를 scene의 애니메이션에 이용할 수 있다.
    render(time) {
        // renderer가 scene을 camera의 시점을 이용해서 렌더링하라.
        this._renderer.render(this._scene, this._camera);
        // time을 전달 받아, 속성 값을 변경함으로써 애니메이션 효과를 발생시킨다.
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }

    // time? requestAnimation 함수가 render함수에 전달해 주는 값이다.
    // 정육면체를 자동으로 회전시키는 코드
    update(time) {
        time *= 0.001; // milli-second unit를 second unit로 변환해줌.
        // 시간은 계속 변하므로, x와 y축으로 cube가 계속 회전한다.
        this._cube.rotation.x = time;
        this._cube.rotation.y = time;
    }
}

window.onload = function () {
    new App();
};
