declare let RenderedTemplate: any;

declare type TemplateProviderResult = {
    template?: string;
    render?: any;
    staticRenderFns?: Array<any>;
}

export default class TemplateProvider {
    static getTemplate(templ: string): TemplateProviderResult {
        let renderedTempl;
        if (templ && templ.charAt(0) === '#' && RenderedTemplate) {
            renderedTempl = RenderedTemplate[templ.substring(1)] as TemplateProviderResult;
        }
        return renderedTempl || { template: templ };
    }
}