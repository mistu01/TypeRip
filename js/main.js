Vue.component('font-panel', {
    props: ['fontname', 'fontstyle', 'familyurl'],
    template: ' <div class="font-row">\
                    <div class="font-row__info">\
                        <a :href="familyurl" class="font-row__name">{{fontname}}</a>\
                        <p class="font-row__style">{{fontstyle}}</p>\
                    </div>\
                    <div class="font-row__actions button_container">\
                        <a class="button button--download" v-on:click="$emit(\'clickdownload\')"><i class="icon ion-md-arrow-down"></i><span>Download</span></a>\
                    </div>\
                </div>'
  })

function createEmptyFontFamily() {
    return {
        name: "",
        designers: [],
        fonts: [],
        sampleText: "",
        foundryName: "",
        slug: "",
        defaultLanguage: ""
    };
}

var typeRipVue = new Vue({
    el: '#typeripvue',
    data: {
        urlInput: "",
        fontIsActive: false,
        fontFamily: createEmptyFontFamily(),
        rawDownload: false,
        message: {visible: true, title: "Typerip", text: "<p>The Adobe Font ripper.</p><br><p>Enter a font family URL from <a href='https://fonts.adobe.com/'>Adobe Fonts</a> to begin.</p><p>By using this tool, you agree to not violate copyright law or licenses established by the font owners, font foundries and/or Adobe. All fonts belong to their respective owners.</p>"}
    },
    methods: {
        resetFontFamily: function() {
            this.fontFamily = createEmptyFontFamily();
        },
        showMessage: function(title_, text_) {
            this.fontIsActive = false
            this.message = {
                visible: true, 
                title: title_, 
                text: text_
            };
            this.resetFontFamily();
        },
        urlSubmitButtonPress: function() {
            this.showMessage("Loading...", "")
            TypeRip.handleRequest(this.urlInput, (responseType_, response_) => {
                if(responseType_ == "error"){
                    this.showMessage("Error", response_)
                }else{
                    const designers = Array.isArray(response_.designers) ? response_.designers : [];
                    const fonts = Array.isArray(response_.fonts) ? response_.fonts : [];

                    this.fontFamily = Object.assign(createEmptyFontFamily(), response_, {
                        designers: designers,
                        fonts: fonts,
                        sampleText: response_.sampleText || ""
                    });
                    this.fontIsActive = true

                    this.removeInjectedFontFaces();

                    fonts.forEach(font => {
                        const fontFaceName = font.cssFontFamily || font.name;
                        var font_css = document.createElement('style');
                        font_css.setAttribute('data-typerip-fontface', fontFaceName);
                        font_css.appendChild(document.createTextNode("@font-face { font-family: '" + fontFaceName + "'; src: url(" + font.url + ");}"));
                        document.head.appendChild(font_css);
                    });
                }
            })
        },
        downloadFonts: function(font_, zipFileName_) {
            TypeRip.downloadFonts(font_, zipFileName_, this.rawDownload);
        },
        removeInjectedFontFaces: function() {
            const nodes = document.querySelectorAll("style[data-typerip-fontface]");
            nodes.forEach(node => node.parentNode && node.parentNode.removeChild(node));
        },
        clearSiteData: function() {
            this.removeInjectedFontFaces();
            try {
                localStorage.clear();
            } catch (e) {}
            try {
                sessionStorage.clear();
            } catch (e) {}
            try {
                if (document.cookie && document.cookie !== "") {
                    document.cookie.split(";").forEach(cookie => {
                        const eqPos = cookie.indexOf("=");
                        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                    });
                }
            } catch (e) {}
            this.urlInput = "";
            this.rawDownload = false;
            const doc = document.firstElementChild;
            if (doc) {
                doc.setAttribute('data-theme', 'light');
            }
            this.showMessage("Site data cleared", "<p>All locally stored information has been removed.</p>");
        }
    }
});
