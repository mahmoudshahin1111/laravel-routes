export class PayloadFilter{
    filter(payload:string):string{
        // (\/\/.*)|(\*(.|\n)*?)|([\n|\s\t]+?)
        let filteredPayload = this.filterInlineComments(payload);
        filteredPayload = this.filterMultiLinesComments(filteredPayload);
        // filteredPayload = this.filterSpaces(filteredPayload);
        return filteredPayload;
    }
    private filterInlineComments(payload:string):string{
        return payload.replace(/\s+\/\/[^\n]+/gm,'');
    }
    private filterMultiLinesComments(payload:string):string{
        return payload.replace(/\/\*(.|\n)*?\*\//gm,'');
    }
    private filterSpaces(payload:string):string{
        return payload.replace(/([\n|\s\t]+?)/gm,'');
    }
} 