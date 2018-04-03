// ClientApp/components/AppHello.ts
import Vue from "vue";
import Component from "vue-class-component";
import TemplateProvider from '../helpers/TemplateProvider';
import HelloComponent from "./Hello";

@Component({
    //template: '#app-hello-template',
    ...TemplateProvider.getTemplate('#app-hello-template'),
    components: {
        HelloComponent
    }
})
export default class extends Vue {
    // data
    name = 'World';
}