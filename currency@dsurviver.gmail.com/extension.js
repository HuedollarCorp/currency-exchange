const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const Me = imports.misc.extensionUtils.getCurrentExtension();
// const prefs = Me.imports.prefs

const API_ADDRESS = 'http://api.fixer.io/';
const LATEST_ENDPOINT = 'latest';
const BASE_QUERY = 'base=';
const SYMBOLS_QUERY = 'symbols=';

let refreshButton, mainLayout, mainCurrencyText, iconBin;
let soupSession;

let lastCurrency = 0.00;

function _createSoupSession() {
    soupSession = new Soup.SessionAsync();
}

function _refreshCurrency() {
    _createSoupSession();
    var requestMessage = Soup.Message.new(
        'GET', API_ADDRESS + LATEST_ENDPOINT + '?' + BASE_QUERY + 'USD');
    soupSession.queue_message(requestMessage, function(session, message) {
        if (message.status_code !== 200) { return; }

        let body = JSON.parse(message.response_body.data);
        let value = body.rates.BRL;
        let arrow;
        if (lastCurrency !== 0) {
            if (value > lastCurrency) {
                arrow = 'arrow-up-symbolic';
            } else if (value < lastCurrency) {
                arrow = 'arrow-down-symbolic';
            }
            let arrowIcon = new St.Icon({
                icon_name: arrow,
                style_class: 'system-status-icon'
            });
            iconBin.set_child(arrowIcon);
        }

        lastCurrency = value;
        mainCurrencyText.set_text('R$ ' + value.toString());
    });
}

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    mainCurrencyText = new St.Label({ text: 'R$ 0.00' });
    mainLayout = new St.BoxLayout();
    refreshButton = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });
    let refreshIcon = new St.Icon({
        icon_name: 'refresh-symbolic',
        style_class: 'system-status-icon'
    });

    refreshButton.set_child(refreshIcon);
    refreshButton.connect('button-press-event', _refreshCurrency);
    iconBin = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    mainLayout.add(refreshButton, 0);
    mainLayout.add(mainCurrencyText, 1);
    mainLayout.add(iconBin, 2);

    _refreshCurrency();
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(mainLayout, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(mainLayout);
}
