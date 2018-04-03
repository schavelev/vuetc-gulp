// ClientApp/index.ts
import Vue from "vue";
import AppHelloComponent from "./components/AppHello";

let v = new Vue({
    el: "#app-root",
    render: h => h(AppHelloComponent),
    components: {
        AppHelloComponent
    }
});