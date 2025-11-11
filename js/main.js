Vue.component('font-panel', {
    props: ['fontname', 'fontstyle', 'fonturl', 'sampletext', 'familyurl'],
    template: ' <div class="column four">\
                    <div class="item">\
                        <div class="upper"><p :style="{fontFamily : fontname}">{{sampletext}}</p></div>\
                        <div class="lower">\
                            <div class="info_container">\
                                <a :href="familyurl"><p>{{fontname}}</p></a>\
                                <p class="small">{{fontstyle}}</p>\
                            </div>\
                            <div class="button_container">\
                                <a class="button" v-on:click="$emit(\'clickdownload\')"><i class="icon ion-md-arrow-down"></i></a>\
                            </div>\
                        </div>\
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
        gridColumns: 3,
        rawDownload: false,
        message: {visible: true, title: "Typerip", text: "<p>The Adobe Font ripper.</p><br><p>Enter a font family URL from <a href='https://fonts.adobe.com/'>Adobe Fonts</a> to begin.</p><p>By using this tool, you agree to not violate copyright law or licenses established by the font owners, font foundries and/or Adobe. All fonts belong to their respective owners.</p>"}
    },
    computed: {
        chunkedFonts: function() {
            const fonts = Array.isArray(this.fontFamily.fonts) ? this.fontFamily.fonts : [];
            const chunkSize = Math.max(1, this.gridColumns);
            const chunks = [];
            for (let i = 0; i < fonts.length; i += chunkSize) {
                chunks.push(fonts.slice(i, i + chunkSize));
            }
            return chunks;
        }
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

                    fonts.forEach(font => {
                        var font_css = document.createElement('style');
                        font_css.appendChild(document.createTextNode("@font-face { font-family: '" + font.name + "'; src: url(" + font.url + ");}"));
                        document.head.appendChild(font_css);
                    });
                }
            })
        },
        downloadFonts: function(font_, zipFileName_) {
            TypeRip.downloadFonts(font_, zipFileName_, this.rawDownload);
        }
    }
});
