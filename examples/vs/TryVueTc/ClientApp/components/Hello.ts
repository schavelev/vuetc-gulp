// ClientApp/components/Hello.ts
import Vue from "vue";
import Component from "vue-class-component";
import TemplateProvider from '../helpers/TemplateProvider';

@Component({
    //template: '#hello-template',
    ...TemplateProvider.getTemplate('#hello-template'),
    props: ['name', 'initialEnthusiasm']
})
export default class extends Vue {
    // props
    name!: string;
    initialEnthusiasm!: number;

    // data
    enthusiasm = this.initialEnthusiasm;

    // methods:
    increment() { this.enthusiasm++; }
    decrement() {
        if (this.enthusiasm > 1) {
            this.enthusiasm--;
        }
    }

    // computed:
    get exclamationMarks() {
        return Array(this.enthusiasm + 1).join('!');
    }
}