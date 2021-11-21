var ERROR = 'ERROR';
var currentPropertyId = 'currentPropertyId';
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

$(window).on('orientationchange', onOrientationChange);

$(document).on('vclick', '#page-home #panel-open', function () {
    $('#page-home #panel').panel('open');
});

$(document).on('vclick', '#page-create #panel-open', function () {
    $('#page-create #panel').panel('open');
});

$(document).on('vclick', '#page-list #panel-open', function () {
    $('#page-list #panel').panel('open');
});

$(document).on('vclick', '#page-about #panel-open', function () {
    $('#page-about #panel').panel('open');
});

// Page CREATE
$(document).on('pagebeforeshow', '#page-create', function () {
    prepareForm('#page-create #frm-register');
});

$(document).on('submit', '#page-create #frm-register', confirmProperty);

//TAKE & SHOW PHOTO
//$(document).on('pagebeforeshow', '#page-create', listImage);
//$(document).on('vclick', '#page-create #frm-register #takeImage', listImage);
//$(document).on('vclick', '#page-create #frm-register #getImage', getImage);
$(document).on('vclick', '#page-create #frm-register #btn-close', function () {
    $('#page-create #img-preview').css('display', 'none');
    $('#page-create #img-preview #gallery').empty();
});

$(document).on('vclick', '#page-create #frm-register #btn-camera', function () {
    getImageCreate(true, Camera.PictureSourceType.PHOTOLIBRARY);
});
$(document).on('vclick', '#page-create #frm-register #btn-gallery',function () {
    getImageCreate(true, Camera.PictureSourceType.CAMERA); 
});

$(document).on('vclick', '#page-detail #frm-note #btn-gallery', function () {
    getImage(true, Camera.PictureSourceType.PHOTOLIBRARY);
});
$(document).on('vclick', '#page-detail #frm-note #btn-camera', function () {
    getImage(true, Camera.PictureSourceType.CAMERA);
});

//$(document).on('vclick', '#page-detail #frm-note #btn-camera', takeNotePicture);


$(document).on('submit', '#page-create #frm-confirm', registerProperty);
$(document).on('vclick', '#page-create #frm-confirm #edit', function () {
    $('#page-create #frm-confirm').popup('close');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    addAddressOption_District($('#page-create #frm-register #district'), this.value);
    addAddressOption_Ward($('#page-create #frm-register #ward'), -1);
});

$(document).on('change', '#page-create #frm-register #district', function () {
    addAddressOption_Ward($('#page-create #frm-register #ward'), this.value);
});

// Page LIST
$(document).on('pagebeforeshow', '#page-list', showList);

$(document).on('submit', '#page-list #frm-search', search);

$(document).on('keyup', $('#page-list #txt-filter'), filterProperty);

$(document).on('change', '#page-list #frm-search #city', function () {
    addAddressOption_District($('#page-list #frm-search #district'), this.value);
    addAddressOption_Ward($('#page-list #frm-search #ward'), -1);
});

$(document).on('change', '#page-list #frm-search #district', function () {
    addAddressOption_Ward($('#page-list #frm-search #ward'), this.value);
});

$(document).on('vclick', '#page-list #btn-reset', showList);
$(document).on('vclick', '#page-list #btn-filter-popup', openFormSearch);
$(document).on('vclick', '#page-list #list-property li a', navigatePageDetail);

// Page DETAIL
$(document).on('pagebeforeshow', '#page-detail', showDetail);

$(document).on('vclick', '#page-detail #img-preview #btn-close', function () {
    $('#page-detail #img-preview').css('display', 'none');
    $('#page-detail #img-preview #gallery').empty();
});

$(document).on('vclick', '#page-detail #btn-update-popup', showUpdate);
$(document).on('vclick', '#page-detail #btn-delete-popup', function () {
    changePopup($('#page-detail #option'), $('#page-detail #frm-delete'));
});

$(document).on('vclick', '#page-detail #frm-update #cancel', function () {
    $('#page-detail #frm-update').popup('close');
});

$(document).on('submit', '#page-detail #frm-note', addNote);
$(document).on('submit', '#page-detail #frm-update', updateProperty);
$(document).on('submit', '#page-detail #frm-delete', deleteProperty);
$(document).on('keyup', '#page-detail #frm-delete #txt-confirm', confirmDeleteProperty);

$(document).on('change', '#page-detail #frm-update #city', function () {
    addAddressOption_District($('#page-detail #frm-update #district'), this.value);
    addAddressOption_Ward($('#page-detail #frm-update #ward'), -1);
});

$(document).on('change', '#page-detail #frm-update #district', function () {
    addAddressOption_Ward($('#page-detail #frm-update #ward'), this.value);
});

// Display messages in the console. Thong bao log loi
function log(message) {
    console.log(`[${new Date()}] ${message}`);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}

//add function for type
function transactionSuccessForTable(tableName) {
    log(`Create table '${tableName}' successfully.`);
}

function transactionSuccessForTableData(tableName, id, name) {
    log(`Insert (${id}, "${name}") into '${tableName}' successfully.`);
}

function onDeviceReady() {
    log(`Device is ready.`);

    //phai co transaction de chay QUERY SQL
    db.transaction(function (tx) {
        // Create a query. 
        //co the drop table bang lenh tren trinh duyet Drop table ....
        //CREATE TABLE ACCOUNT
        var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Username TEXT NOT NULL UNIQUE,
                                                         Password TEXT NOT NULL)`;

        // Execute a query. khi thanh cong se tro transactionsuccess neu fail thi vao transactionerror
        tx.executeSql(query, [], transactionSuccess_ACCOUNT, transactionError);

        function transactionSuccess_ACCOUNT(tx, result) {
            // Logging.
            log(`Create table 'Account' successfully.`);
        }

        //CREATE TABLE PROPERTY
        var query = `CREATE TABLE IF NOT EXISTS Property (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            PropName TEXT NOT NULL UNIQUE,
                                                            PropAdd TEXT NOT NULL,
                                                            PropCity INTEGER NOT NULL,
                                                            PropDist INTEGER NOT NULL,
                                                            PropWard INTEGER NOT NULL,
                                                            PropType INTEGER NOT NULL,
                                                            PropFur INTEGER NULL,
                                                            PropRoom INTEGER NOT NULL,
                                                            PropPrice REAL NOT NULL,
                                                            PropReporter TEXT NULL,
                                                            DateAdded REAL NOT NULL,
                                                            AccountId INTEGER NULL)`;
        //  FOREIGN KEY (AccountId) REFERENCES Account(Id))`;
        // Execute a query. khi thanh cong se tro transactionsuccess neu fail thi vao transactionerror
        tx.executeSql(query, [], transactionSuccessForTable('Property'), transactionError);

        // Create table PROPERTY IMAGE.
        var query = `CREATE TABLE IF NOT EXISTS PropertyImage (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            Image BLOB,
                                                            PropertyId INTEGER NOT NULL,
                                                            FOREIGN KEY (PropertyId) REFERENCES Property(Id) ON DELETE CASCADE)`;
        tx.executeSql(query, [], transactionSuccessForTable('Property Image'), transactionError);

        // Create table IMAGE.
        var query = ` CREATE TABLE IF NOT EXISTS Image (Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Image BLOB)`;
        tx.executeSql(query, [], transactionSuccessForTable('Image_Test'), transactionError);

        // Create table NOTE.
        query = `CREATE TABLE IF NOT EXISTS Note ( Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    Message TEXT NOT NULL,
                                                    DateAdded REAL NOT NULL,
                                                    PropertyId INTEGER NOT NULL,
                                                    FOREIGN KEY (PropertyId) REFERENCES Property(Id) ON DELETE CASCADE)`;
        tx.executeSql(query, [], transactionSuccessForTable('Note'), transactionError);

        // Create table NOTE IMAGE.
        query = `CREATE TABLE IF NOT EXISTS NoteImage ( Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        Image BLOB,
                                                        NoteId INTEGER NOT NULL,
                                                        FOREIGN KEY (NoteId) REFERENCES Note(Id) ON DELETE CASCADE)`;
        tx.executeSql(query, [], transactionSuccessForTable('Note Image'), transactionError);

    });

    prepareDatabase(db);

}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

function changePopup(sourcePopup, destinationPopup) {
    var afterClose = function () {
        destinationPopup.popup("open");
        sourcePopup.off("popupafterclose", afterClose);
    };

    sourcePopup.on("popupafterclose", afterClose);
    sourcePopup.popup("close");
}

//Add option 
function prepareForm(form) {
    addAddressOption($(`${form} #city`), 'City');
    addAddressOption_District($(`${form} #district`), -1);
    addAddressOption_Ward($(`${form} #ward`), -1);

    addOption($(`${form} #PropFur`), Furniture, 'Furniture');
    addOption($(`${form} #PropType`), Type, 'Type');
}

function addAddressOption_District(select, selectedId, selectedValue = -1) {
    addAddressOption(select, 'District', selectedValue, `WHERE CityId = ${selectedId}`);
}

function addAddressOption_Ward(select, selectedId, selectedValue = -1) {
    addAddressOption(select, 'Ward', selectedValue, `WHERE DistrictId = ${selectedId}`);
}

function addAddressOption(select, name, selectedValue = -1, condition = '') {
    db.transaction(function (tx) {
        var query = `SELECT * FROM ${name} ${condition} ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of ${name} successfully.`);

            var optionList = `<option value="-1">Select ${name}</option>`;

            for (let item of result.rows) {
                optionList += `<option value="${item.Id}" ${item.Id == selectedValue ? 'selected' : ''}>${item.Name}</option>`;
            }

            select.html(optionList);
            select.selectmenu('refresh', true);
        }
    });
}

function addOption(select, list, name, selectedValue = -1) {
    var optionList = `<option value="-1">Select ${name}</option>`;

    for (var key in list) {
        optionList += `<option value="${list[key]}" ${list[key] == selectedValue ? 'selected' : ''}>${key}</option>`;
    }

    select.html(optionList);
    select.selectmenu('refresh', true);
}

function getFormInfoByValue(form, isNote) {
    var note = isNote ? $(`${form} #note`).val() : '';

    var info = {
        'Name': $(`${form} #PropName`).val(),
        'Street': $(`${form} #PropAdd`).val(),
        'City': $(`${form} #city`).val(),
        'District': $(`${form} #district`).val(),
        'Ward': $(`${form} #ward`).val(),
        'Type': $(`${form} #PropType`).val(),
        'Bedroom': $(`${form} #PropRoom`).val(),
        'Price': $(`${form} #PropPrice`).val(),
        'Furniture': $(`${form} #PropFur`).val(),
        'Owner': $(`${form} #PropReporter`).val(),
        'Note': note
    };

    return info;
}

function getFormInfoByName(form, isNote) {
    var note = isNote ? $(`${form} #note`).val() : '';

    var info = {
        'Name': $(`${form} #PropName`).val(),
        'Street': $(`${form} #PropAdd`).val(),
        'City': $(`${form} #city option:selected`).text(),
        'District': $(`${form} #district option:selected`).text(),
        'Ward': $(`${form} #ward option:selected`).text(),
        'Type': $(`${form} #PropType option:selected`).text(),
        'Bedroom': $(`${form} #PropRoom`).val(),
        'Price': $(`${form} #PropPrice`).val(),
        'Furniture': $(`${form} #PropFur option:selected`).text(),
        'Owner': $(`${form} #PropReporter`).val(),
        'Note': note
    };

    return info;
}
//info. ten dat tren info phia tren
function setFormInfo(form, info, isNote) {
    $(`${form} #PropName`).val(info.Name);
    $(`${form} #PropAdd`).val(info.Street);
    $(`${form} #PropCity`).val(info.City);
    $(`${form} #PropDist`).val(info.District);
    $(`${form} #PropWard`).val(info.Ward);
    $(`${form} #PropType`).val(info.Type);
    $(`${form} #PropFur`).val(info.Furniture);
    $(`${form} #PropRoom`).val(info.Bedroom);
    $(`${form} #PropPrice`).val(info.Price);
    $(`${form} #PropReporter`).val(info.Owner);

    if (isNote)
        $(`${form} #note`).val(info.Note);
}

function setHTMLInfo(form, info, isNote, isDate = false) {
    $(`${form} #PropName`).text(info.Name);
    $(`${form} #PropAdd`).text(info.Street);
    $(`${form} #PropCity`).text(info.City);
    $(`${form} #PropDist`).text(info.District);
    $(`${form} #PropWard`).text(info.Ward);
    $(`${form} #PropType`).text(info.Type);
    $(`${form} #PropFur`).text(info.Furniture);
    $(`${form} #PropRoom`).text(info.Bedroom);
    $(`${form} #PropPrice`).text(`${info.Price.toLocaleString('en-US')} VNĐ / month`);
    $(`${form} #PropReporter`).text(info.Owner);

    if (isNote)
        $(`${form} #note`).text(info.Note);

    if (isDate)
        $(`${form} #DateAdded`).text(info.DateAdded);
}

function isValid(form) {
    var isValid = true;
    var error = $(`${form} #error`);

    error.empty();

    if ($(`${form} #city`).val() == -1) {
        isValid = false;
        error.append('<p>* City is required.</p>');
        alert('Please fill in all field');
    }

    if ($(`${form} #district`).val() == -1) {
        isValid = false;
        error.append('<p>* District is required.</p>');
    }

    if ($(`${form} #ward`).val() == -1) {
        isValid = false;
        error.append('<p>* Ward is required.</p>');
    }

    if ($(`${form} #PropType`).val() == -1) {
        isValid = false;
        error.append('<p>* Property Type is required.</p>');

    }

    if ($(`${form} #PropFur`).val() == -1) {
        isValid = false;
        error.append('<p>* Property Furniture is required.</p>');

    }

    return isValid;
}

function confirmProperty(e) {
    e.preventDefault();

    if (isValid('#page-create #frm-register')) {
        var info = getFormInfoByName('#page-create #frm-register', true);

        db.transaction(function (tx) {
            var query = 'SELECT * FROM Property WHERE PropName = ?';
            tx.executeSql(query, [info.Name], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                if (result.rows[0] == null) {
                    log('Open the confirmation popup.');

                    $('#page-create #error').empty();

                    setHTMLInfo('#page-create #frm-confirm', info, true);

                    $('#page-create #frm-confirm').popup('open');
                }
                else {
                    //install plugin: cordova plugin add cordova-plugin-dialogs
                    navigator.notification.beep(2);

                    //vibration: cordova plugin add cordova-plugin-vibration
                    navigator.vibrate(3000,1000,3000);

                    alert('Property Name exists');
                    var error = 'Property Name exists';
                    $('#page-create #error').empty().append(error);
                    log(error, ERROR);
                }
            }
        });
    }
}

function registerProperty(e) {
    e.preventDefault();

    var info = getFormInfoByValue('#page-create #frm-register', true);

    db.transaction(function (tx) {
        var query = `INSERT INTO Property (PropName, PropAdd, PropCity, PropDist, PropWard, PropType, PropRoom, PropPrice, PropFur, PropReporter, DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, julianday('now'))`;
        tx.executeSql(query, [info.Name, info.Street, info.City, info.District, info.Ward, info.Type, info.Bedroom, info.Price, info.Furniture, info.Owner], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a property '${info.Name}' successfully.`);

            $('#page-create #frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#page-create #frm-register #PropName').focus();

            $('#page-create #frm-confirm').popup('close');

            db.transaction(function (tx) {
                var query = `INSERT INTO Note (Message, PropertyId, DateAdded) VALUES (?, ?, julianday('now'))`;
                tx.executeSql(query, [info.Note, result.insertId], transactionSuccess, transactionError);

            /*    var query = `INSERT INTO PropertyImage (Image, PropertyId) VALUES (?, ?)`;
                tx.executeSql(query, [info.Image, result.insertID], transactionSuccess, transactionError);
            */
                function transactionSuccess(tx, result) {
                    alert(`You have successfully listing '${info.Name}' property.`);
                    navigator.notification.beep(1);
                    log(`Add new property '${info.Name}' successfully.`);
                }
            });
        }
    });
}

function showList() {
    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.PropName AS PropName, PropPrice, PropRoom, PropType, City.Name AS PropCity
                     FROM Property LEFT JOIN City ON Property.PropCity = City.Id`;

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of properties successfully.`);
            displayList(result.rows);
        }
    });
}

function navigatePageDetail(e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem(currentPropertyId, id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
}

function showDetail() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT Property.*, datetime(Property.DateAdded, '+7 hours') AS DateAddedConverted, City.Name AS CityName, District.Name AS DistrictName, Ward.Name AS WardName
                     FROM Property
                     LEFT JOIN City ON City.Id = Property.PropCity
                     LEFT JOIN District ON District.Id = Property.PropDist
                     LEFT JOIN Ward ON Ward.Id = Property.PropWard
                     WHERE Property.Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].PropName}' successfully.`);

                var info = {
                    'Name': result.rows[0].PropName,
                    'Street': result.rows[0].PropAdd,
                    'City': result.rows[0].CityName,
                    'District': result.rows[0].DistrictName,
                    'Ward': result.rows[0].WardName,
                    'Type': Object.keys(Type)[result.rows[0].PropType],
                    'Bedroom': result.rows[0].PropRoom,
                    'Price': result.rows[0].PropPrice,
                    'Furniture': Object.keys(Furniture)[result.rows[0].PropFur],
                    'Owner': result.rows[0].PropReporter,
                    'DateAdded': result.rows[0].DateAddedConverted
                };
                //appendPropImage(Property.Id);
                setHTMLInfo('#page-detail #detail', info, false, true);

                showNote();
            }
            else {
                var errorMessage = 'Property not found.';

                log(errorMessage, ERROR);

                $('#page-detail #detail #name').text(errorMessage);
                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }
        }
    });
}

function confirmDeleteProperty() {
    var text = $('#page-detail #frm-delete #txt-confirm').val();

    if (text == 'confirm') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deleteProperty(e) {
    e.preventDefault();

    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = 'DELETE FROM Note WHERE PropertyId = ?';
        tx.executeSql(query, [id], function (tx, result) {
            log(`Delete notes of property '${id}' successfully.`);
        }, transactionError);

        var query = 'DELETE FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], function (tx, result) {
            log(`Delete property '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }, transactionError);
    });
}

function addNote(e) {
    e.preventDefault();

    var id = localStorage.getItem(currentPropertyId);
    var message = $('#page-detail #frm-note #message').val();

    if (message != '' || $('#page-detail #img-preview').css('display') != 'none') {
        db.transaction(function (tx) {
            var query = `INSERT INTO Note (Message, PropertyId, DateAdded) VALUES (?, ?, julianday('now'))`;
            tx.executeSql(query, [message, id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                log(`Add new note to property '${id}' successfully.`);

                addNoteImage(result.insertId);
            }
        });
    }
}

function addNoteImage(noteId) {
    db.transaction(function (tx) {
        var image = $('#page-detail #img-preview #gallery img');
        var query = 'INSERT INTO NoteImage (Image, NoteId) VALUES (?, ?)';

        for (var i = 0; i < image.length; i++) {
            var src = image[i].src;
            tx.executeSql(query, [src.substring(23, src.length), noteId], transactionSuccess, transactionError);
        }

        function transactionSuccess(tx, result) {
            log(`Add note image for note '${noteId}' successfully.`);
        }

        $('#page-detail #img-preview').css('display', 'none');
        $('#page-detail #img-preview #gallery').empty();
        $('#page-detail #frm-note').trigger('reset');

        showNote();
    }); toLocaleString
}

function addPropImage(propID) {
    db.transaction(function (tx) {
        var image = $('#page-create #img-preview #gallery img');
        var query = 'INSERT INTO PropertyImage (Image, PropertyID) VALUES (?, ?)';

        for (var i = 0; i < image.length; i++) {
            var src = image[i].src;
            tx.executeSql(query, [src.substring(23, src.length), PropertyID], transactionSuccess, transactionError);
        }

        function transactionSuccess(tx, result) {
            log(`Add image for '${PropertyID}' successfully.`);
        }

        $('#page-create #img-preview').css('display', 'none');
        $('#page-create #img-preview #gallery').empty();
        $('#page-create #frm-register').trigger('reset');

        showNote();
    }); toLocaleString
}

function showNote() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT Id, Message, datetime(DateAdded, '+7 hours') AS DateAdded FROM Note WHERE PropertyId = ? ORDER BY DateAdded DESC`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of notes successfully.`);

            var noteList = '';
            for (let note of result.rows) {
                noteList += `
                    <div class='list'>
                        <table>
                            <tr>
                                <th rowspan='2'><img src='img/user_i1.png' class='avatar'></th>
                                <td><strong>Thanh Trinh</strong></td>
                            </tr>

                            <tr>
                                <td><small>${note.DateAdded}</small></td>
                            </tr>
                        </table>
                        
                        <p>${note.Message}</p>
                        
                        <p id='${note.Id}'></p>
                    </div>`;

                appendNoteImage(note.Id);
            }

            noteList += `<div class='list end-list'>You've reached the end of the list.</div>`;

            $('#list-note').empty().append(noteList);

            log(`Show list of notes successfully.`);
        }
    });
}

function appendNoteImage(noteId) {
    db.transaction(function (tx) {
        query = 'SELECT Image FROM NoteImage WHERE NoteId = ?';

        tx.executeSql(query, [noteId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var imageList = '';
            for (let image of result.rows)
                imageList += `<img src='data:image/jpeg;base64,${image.Image}' class='note-image'>`;

            $(`#page-detail #list-note #${noteId}`).append(imageList);
        }
    });
}

function appendPropImage(Id) {
    db.transaction(function (tx) {
        query = 'SELECT Image FROM PropertyImage WHERE PropertyID = ?';

        tx.executeSql(query, [Id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var imageList = '';
            for (let image of result.rows)
                imageList += `<img src='data:image/jpeg;base64,${image.Image}' class='note-image'>`;

            $(`#page-detail #list-note #${Id}`).append(imageList);
        }
    });
}

function showUpdate() {
    var id = localStorage.getItem(currentPropertyId);

    db.transaction(function (tx) {
        var query = `SELECT * FROM Property WHERE Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of property '${result.rows[0].PropName}' successfully.`);
                //TESTING
                $(`#page-detail #frm-update #PropName`).val(result.rows[0].PropName);
                $(`#page-detail #frm-update #PropAdd`).val(result.rows[0].PropAdd);
                $(`#page-detail #frm-update #PropPrice`).val(result.rows[0].PropPrice);
                $(`#page-detail #frm-update #PropRoom`).val(result.rows[0].PropRoom);
                $(`#page-detail #frm-update #PropReporter`).val(result.rows[0].PropReporter);

                addAddressOption($('#page-detail #frm-update #city'), 'City', result.rows[0].City);
                addAddressOption_District($('#page-detail #frm-update #district'), result.rows[0].City, result.rows[0].District);
                addAddressOption_Ward($('#page-detail #frm-update #ward'), result.rows[0].District, result.rows[0].Ward);

                addOption($('#page-detail #frm-update #PropType'), Type, 'Type', result.rows[0].Type);
                addOption($('#page-detail #frm-update #PropFur'), Furniture, 'Furniture', result.rows[0].Furniture);

                changePopup($('#page-detail #option'), $('#page-detail #frm-update'));
            }
        }
    });
}

function updateProperty(e) {
    e.preventDefault();

    if (isValid('#page-detail #frm-update')) {
        var id = localStorage.getItem(currentPropertyId);
        var info = getFormInfoByValue('#page-detail #frm-update', false);

        //Change PropName here from Name
        db.transaction(function (tx) {
            var query = `UPDATE Property
                        SET PropName = ?,
                        PropAdd = ?, PropCity = ?, PropDist = ?, PropWard = ?,
                        PropType = ?, PropRoom = ?, PropPrice = ?, PropFur = ?, PropReporter = ?,
                            DateAdded = julianday('now')
                        WHERE Id = ?`;

            tx.executeSql(query, [info.Name, info.Street, info.City, info.District, info.Ward, info.Type, info.Bedroom, info.Price, info.Furniture, info.Owner, id], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                log(`Update property '${info.Name}' successfully.`);
                showDetail();
                $('#page-detail #frm-update').popup('close');
            }
        });
    }
}

function filterProperty() {
    var filter = $('#page-list #txt-filter').val().toLowerCase();
    var li = $('#page-list #list-property ul li');

    for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("a")[0];
        var text = a.textContent || a.innerText;

        li[i].style.display = text.toLowerCase().indexOf(filter) > -1 ? "" : "none";
    }
}

function openFormSearch(e) {
    e.preventDefault();
    prepareForm('#page-list #frm-search');
    $('#page-list #frm-search').popup('open');
}

//SEARCH
function search(e) {
    e.preventDefault();

    var name = $('#page-list #frm-search #PropName').val();
    var street = $('#page-list #frm-search #PropAdd').val();
    var city = $('#page-list #frm-search #city').val();
    var district = $('#page-list #frm-search #district').val();
    var ward = $('#page-list #frm-search #ward').val();
    var type = $('#page-list #frm-search #PropType').val();
    var bedroom = $('#page-list #frm-search #PropRoom').val();
    var furniture = $('#page-list #frm-search #PropFur').val();
    var reporter = $('#page-list #frm-search #PropReporter').val();
    var priceMin = $('#page-list #frm-search #price-min').val();
    var priceMax = $('#page-list #frm-search #price-max').val();

    db.transaction(function (tx) {
        var query = `SELECT Property.Id AS Id, Property.PropName AS PropName, PropAdd, PropPrice, PropRoom, PropType, City.Name AS PropCity
                     FROM Property LEFT JOIN City ON Property.PropCity = City.Id
                     WHERE`;

        query += name ? ` Property.PropName LIKE "%${name}%"   AND` : '';
        query += street ? ` PropAdd LIKE "%${street}%"   AND` : '';
        query += city != -1 ? ` PropCity = ${city}   AND` : '';
        query += district != -1 ? ` PropDist = ${district}   AND` : '';
        query += ward != -1 ? ` PropWard = ${ward}   AND` : '';
        query += type != -1 ? ` PropType = ${type}   AND` : '';
        query += bedroom ? ` PropRoom = ${bedroom}   AND` : '';
        query += furniture != -1 ? ` PropFur = ${furniture}   AND` : '';
        query += reporter ? ` PropReporter LIKE "%${reporter}%"   AND` : '';
        query += priceMin ? ` PropPrice >= ${priceMin}   AND` : '';
        query += priceMax ? ` PropPrice <= ${priceMax}   AND` : '';

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            navigator.notification.beep(1);
            log(`Search properties successfully.`);

            displayList(result.rows);

            $('#page-list #frm-search').trigger('reset');
            $('#page-list #frm-search').popup('close');
        }
    });
}

//Hien thi danh sach truoc khi search
function displayList(list) {
    var propertyList = `<ul id='list-property' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;

    propertyList += list.length == 0 ? '<li><h2>There is no property.</h2></li>' : '';

    for (let property of list) {
        propertyList +=
            `<li><a data-details='{"Id" : ${property.Id}}'>
                <h2 style='margin-bottom: 0px;'>${property.PropName}</h2>
                <p style='margin-top: 2px; margin-bottom: 10px;'><small>${property.PropCity}</small></p>
                
                <div>
                    <img src='img/icon-bedroom.png' height='20px' style='margin-bottom: -5px;'>
                    <strong style='font-size: 13px;'>${property.PropRoom}<strong>
                    
                    &nbsp;&nbsp;
                    
                    <img src='img/icon-type.png' height='21px' style='margin-bottom: -5px;'>
                    <strong style='font-size: 13px;'>${Object.keys(Type)[property.PropType]}<strong>
                    
                    &nbsp;&nbsp;
                    
                    <img src='img/icon-price.png' height='20px' style='margin-bottom: -3px;'>
                    <strong style='font-size: 13px;'>${property.PropPrice.toLocaleString('en-US')} VNĐ / month<strong>
                </div>
            </a></li>`;
    }
    propertyList += `</ul>`;

    $('#list-property').empty().append(propertyList).listview('refresh').trigger('create');

    log(`Show list of properties successfully.`);
}

/*
function takePicture() {
    var cameraOptions = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: true
    }
    navigator.camera.getPicture(success, error, cameraOptions);

    function success(imageData) {
        db.transaction(function (tx) {
            var query = 'Insert Into Image (Image) VALUES (?)';
            tx.executeSql(query, [imageData], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                alert('Successfuly store in database.');
            }
        });
    }

    function error(error) {
        alert(`Failed to take picture. Error:${error}.`);
    }

}
*/

/*
function listImage() {
    db.transaction(function (tx) {
        var query = 'Select * from Image';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            $('#page-create #gallery').empty();

            for (let image of result.rows) {
                $('#page-create #gallery').append(`<img src='data:image/jpeg;base64,${image.Image}' width='50%'>`);
            }
        }
    });
}
*/
/*
function takePicture() {
    var cameraOptions = {
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true
    }
    navigator.camera.getPicture(success, error, cameraOptions);

    function success(imageData) {
        db.transaction(function (tx) {
            var query = 'Insert Into PropertyImage (Image,PropertyId) VALUES (?,?)';
            tx.executeSql(query, [imageData,propID], transactionSuccess, transactionError);

            function transactionSuccess(tx, result) {
                alert('Successfuly store in database.');
            }
        });
    }
    function error(error) {
        alert(`Failed to take picture. Error:${error}.`);
    }
}*/

function getImage(saveToPhotoAlbum, sourceType) {
    var options = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: saveToPhotoAlbum,
        sourceType: sourceType
    };

    navigator.camera.getPicture(success, error, options);

    function success(imageData) {
        var display = $('#page-detail #img-preview').css('display');

        if (display == 'none') {
            $('#page-detail #img-preview #gallery').empty();
            $('#page-detail #img-preview').css('display', 'block');
        }

        $('#page-detail #img-preview #gallery').append(`<img src='data:image/jpeg;base64,${imageData}'>`);
    }

    function error(error) {
        alert(`Failed to get picture. Error: ${error}.`);
    }
}

function getImageCreate(saveToPhotoAlbum, sourceType) {
    var options = {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: saveToPhotoAlbum,
        sourceType: sourceType
    };

    navigator.camera.getPicture(success, error, options);

    function success(imageData) {
        var display = $('#page-create #img-preview').css('display');

        if (display == 'none') {
            $('#page-create #img-preview #gallery').empty();
            $('#page-create #img-preview').css('display', 'block');
        }

        $('#page-create #img-preview #gallery').append(`<img src='data:image/jpeg;base64,${imageData}'>`);
    }

    function error(error) {
        alert(`Failed to get picture. Error: ${error}.`);
    }
}

/*
function takeQRCode() {
    cordova.plugins.barcodeScanner.scan(success, error);

    function success(result) {
        alert(`Result: ${result.text}.\nType: ${result.format}.`);
    }

    function error(error) {
        alert(`Failed: ${error}.`);
    }
}
*/