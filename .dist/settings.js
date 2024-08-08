import { Permissions } from "./permissions.js";
import { SnowFlake } from "./snowflake.js";
import { Role } from "./role.js";
class Buttons {
    name;
    buttons;
    bigtable;
    warndiv;
    constructor(name) {
        this.buttons = [];
        this.name = name;
    }
    add(name, thing = undefined) {
        if (!thing) {
            thing = new Options(name, this);
        }
        this.buttons.push([name, thing]);
        return thing;
    }
    generateHTML() {
        const bigtable = document.createElement("div");
        bigtable.classList.add("Buttons");
        bigtable.classList.add("flexltr");
        this.bigtable = bigtable;
        const htmlarea = document.createElement("div");
        htmlarea.classList.add("flexgrow");
        const buttonTable = document.createElement("div");
        buttonTable.classList.add("flexttb", "settingbuttons");
        for (const thing of this.buttons) {
            const button = document.createElement("button");
            button.classList.add("SettingsButton");
            button.textContent = thing[0];
            button.onclick = _ => {
                this.generateHTMLArea(thing[1], htmlarea);
                if (this.warndiv) {
                    this.warndiv.remove();
                }
            };
            buttonTable.append(button);
        }
        this.generateHTMLArea(this.buttons[0][1], htmlarea);
        bigtable.append(buttonTable);
        bigtable.append(htmlarea);
        return bigtable;
    }
    handleString(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div;
    }
    generateHTMLArea(genation, htmlarea) {
        let html;
        if (genation instanceof Options) {
            html = genation.generateHTML();
        }
        else {
            html = this.handleString(genation);
        }
        htmlarea.innerHTML = "";
        htmlarea.append(html);
    }
    changed(html) {
        this.warndiv = html;
        this.bigtable.append(html);
    }
    save() { }
    submit() {
    }
}
class PermissionToggle {
    rolejson;
    permissions;
    owner;
    constructor(roleJSON, permissions, owner) {
        this.rolejson = roleJSON;
        this.permissions = permissions;
        this.owner = owner;
    }
    generateHTML() {
        const div = document.createElement("div");
        div.classList.add("setting");
        const name = document.createElement("span");
        name.textContent = this.rolejson.readableName;
        name.classList.add("settingsname");
        div.append(name);
        div.append(this.generateCheckbox());
        const p = document.createElement("p");
        p.textContent = this.rolejson.description;
        div.appendChild(p);
        return div;
    }
    generateCheckbox() {
        const div = document.createElement("div");
        div.classList.add("tritoggle");
        const state = this.permissions.getPermission(this.rolejson.name);
        const on = document.createElement("input");
        on.type = "radio";
        on.name = this.rolejson.name;
        div.append(on);
        if (state === 1) {
            on.checked = true;
        }
        ;
        on.onclick = _ => {
            this.permissions.setPermission(this.rolejson.name, 1);
            this.owner.changed();
        };
        const no = document.createElement("input");
        no.type = "radio";
        no.name = this.rolejson.name;
        div.append(no);
        if (state === 0) {
            no.checked = true;
        }
        ;
        no.onclick = _ => {
            this.permissions.setPermission(this.rolejson.name, 0);
            this.owner.changed();
        };
        if (this.permissions.hasDeny) {
            const off = document.createElement("input");
            off.type = "radio";
            off.name = this.rolejson.name;
            div.append(off);
            if (state === -1) {
                off.checked = true;
            }
            ;
            off.onclick = _ => {
                this.permissions.setPermission(this.rolejson.name, -1);
                this.owner.changed();
            };
        }
        return div;
    }
    submit() {
    }
}
class TextInput {
    label;
    owner;
    onSubmit;
    textContent;
    input;
    constructor(label, onSubmit, owner, { initText = "" } = {}) {
        this.label = label;
        this.textContent = initText;
        this.owner = owner;
        this.onSubmit = onSubmit;
    }
    generateHTML() {
        const div = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = this.label;
        div.append(span);
        const input = document.createElement("input");
        input.value = this.textContent;
        input.type = "text";
        input.oninput = this.onChange.bind(this);
        this.input = new WeakRef(input);
        div.append(input);
        return div;
    }
    onChange(ev) {
        this.owner.changed();
        const value = this.input.deref().value;
        this.onchange(value);
        this.textContent = value;
    }
    onchange = _ => { };
    watchForChange(func) {
        this.onchange = func;
    }
    submit() {
        this.onSubmit(this.textContent);
    }
}
class MDInput {
    label;
    owner;
    onSubmit;
    textContent;
    input;
    constructor(label, onSubmit, owner, { initText = "" } = {}) {
        this.label = label;
        this.textContent = initText;
        this.owner = owner;
        this.onSubmit = onSubmit;
    }
    generateHTML() {
        const div = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = this.label;
        div.append(span);
        div.append(document.createElement("br"));
        const input = document.createElement("textarea");
        input.value = this.textContent;
        input.oninput = this.onChange.bind(this);
        this.input = new WeakRef(input);
        div.append(input);
        return div;
    }
    onChange(ev) {
        this.owner.changed();
        const value = this.input.deref().value;
        this.onchange(value);
        this.textContent = value;
    }
    onchange = _ => { };
    watchForChange(func) {
        this.onchange = func;
    }
    submit() {
        this.onSubmit(this.textContent);
    }
}
class FileInput {
    label;
    owner;
    onSubmit;
    input;
    constructor(label, onSubmit, owner, {} = {}) {
        this.label = label;
        this.owner = owner;
        this.onSubmit = onSubmit;
    }
    generateHTML() {
        const div = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = this.label;
        div.append(span);
        const input = document.createElement("input");
        input.type = "file";
        input.oninput = this.onChange.bind(this);
        this.input = new WeakRef(input);
        div.append(input);
        return div;
    }
    onChange(ev) {
        this.owner.changed();
        if (this.onchange) {
            this.onchange(this.input.deref().files);
        }
    }
    onchange = null;
    watchForChange(func) {
        this.onchange = func;
    }
    submit() {
        this.onSubmit(this.input.deref().files);
    }
}
class RoleList extends Buttons {
    permissions;
    permission;
    guild;
    channel;
    options;
    onchange;
    curid;
    constructor(permissions, guild, onchange, channel = false) {
        super("Roles");
        this.guild = guild;
        this.permissions = permissions;
        this.channel = channel;
        this.onchange = onchange;
        const options = new Options("", this);
        if (channel) {
            this.permission = new Permissions("0", "0");
        }
        else {
            this.permission = new Permissions("0");
        }
        for (const thing of Permissions.info) {
            options.addPermissionToggle(thing, this.permission); //
        }
        for (const i of permissions) {
            console.log(i);
            this.buttons.push([i[0].getObject().name, i[0].id]); //
        }
        this.options = options;
    }
    handleString(str) {
        this.curid = str;
        const perm = this.permissions.find(_ => _[0].id === str)[1];
        this.permission.deny = perm.deny;
        this.permission.allow = perm.allow;
        this.options.name = SnowFlake.getSnowFlakeFromID(str, Role).getObject().name;
        this.options.haschanged = false;
        return this.options.generateHTML();
    }
    save() {
        this.onchange(this.curid, this.permission);
    }
}
class HtmlArea {
    submit;
    html;
    constructor(html, submit) {
        this.submit = submit;
        this.html = html;
    }
    generateHTML() {
        if (this.html instanceof Function) {
            return this.html();
        }
        else {
            return this.html;
        }
    }
}
class Options {
    name;
    haschanged = false;
    options;
    owner;
    ltr;
    constructor(name, owner, { ltr = false } = {}) {
        this.name = name;
        this.options = [];
        this.owner = owner;
        this.ltr = ltr;
    }
    addPermissionToggle(roleJSON, permissions) {
        this.options.push(new PermissionToggle(roleJSON, permissions, this));
    }
    addOptions(name, { ltr = false } = {}) {
        const options = new Options(name, this, { ltr });
        this.options.push(options);
        return options;
    }
    addFileInput(label, onSubmit, {} = {}) {
        const FI = new FileInput(label, onSubmit, this, {});
        this.options.push(FI);
        return FI;
    }
    addTextInput(label, onSubmit, { initText = "" } = {}) {
        const textInput = new TextInput(label, onSubmit, this, { initText });
        this.options.push(textInput);
        return textInput;
    }
    addMDInput(label, onSubmit, { initText = "" } = {}) {
        const mdInput = new MDInput(label, onSubmit, this, { initText });
        this.options.push(mdInput);
        return mdInput;
    }
    addHTMLArea(html, submit = () => { }) {
        const htmlarea = new HtmlArea(html, submit);
        this.options.push(htmlarea);
        return htmlarea;
    }
    generateHTML() {
        const div = document.createElement("div");
        div.classList.add("titlediv");
        if (this.name !== "") {
            const title = document.createElement("h2");
            title.textContent = this.name;
            div.append(title);
            title.classList.add("settingstitle");
        }
        const table = document.createElement("div");
        table.classList.add(this.ltr ? "flexltr" : "flexttb", "flexspace");
        for (const thing of this.options) {
            table.append(thing.generateHTML());
        }
        div.append(table);
        return div;
    }
    changed() {
        if (this.owner instanceof Options) {
            this.owner.changed();
            return;
        }
        if (!this.haschanged) {
            const div = document.createElement("div");
            div.classList.add("flexltr", "savediv");
            const span = document.createElement("span");
            div.append(span);
            span.textContent = "Careful, you have unsaved changes";
            const button = document.createElement("button");
            button.textContent = "Save changes";
            div.append(button);
            this.haschanged = true;
            this.owner.changed(div);
            button.onclick = _ => {
                if (this.owner instanceof Buttons) {
                    this.owner.save();
                }
                div.remove();
                this.submit();
            };
        }
    }
    submit() {
        for (const thing of this.options) {
            thing.submit();
        }
    }
}
class Settings extends Buttons {
    static Buttons = Buttons;
    static Options = Options;
    html;
    constructor(name) {
        super(name);
    }
    addButton(name, { ltr = false } = {}) {
        const options = new Options(name, this, { ltr });
        this.add(name, options);
        return options;
    }
    show() {
        const background = document.createElement("div");
        background.classList.add("background");
        const title = document.createElement("h2");
        title.textContent = this.name;
        title.classList.add("settingstitle");
        background.append(title);
        background.append(this.generateHTML());
        const exit = document.createElement("span");
        exit.textContent = "✖";
        exit.classList.add("exitsettings");
        background.append(exit);
        exit.onclick = _ => { this.hide(); };
        document.body.append(background);
        this.html = background;
    }
    hide() {
        this.html.remove();
        this.html = null;
    }
}
export { Settings, RoleList };
