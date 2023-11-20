// ---- Define your dialogs  and panels here ----

$('#sidepanel').prepend('<h2>Select File and Member to see permissions:</h2>','<h3>Remember to double check your changes in the permissions table to the right before you submit</h3>','<p>Click on the info logo to see whether the actions are allowed or not</p>');
// ---- Permissions Table -------
var new_perm_table = define_new_effective_permissions("newPermissionsTable_", add_info_col = true, which_permissions = null);
$('#sidepanel').append(new_perm_table);


$('#newPermissionsTable_').attr('filepath', '/C/presentation_documents/important_file.txt');
var new_user_field = define_new_user_select_field("newUserSelectField_", "Select User", on_user_change = function(selected_user){
    $('#newPermissionsTable_').attr('username', selected_user);
});

$('#newPermissionsTable_').attr('username', 'employee1');
var new_file_field = define_new_file_select_field("newFileSelectField_", "Select File", on_file_change = function(selected_file){
    $('#newPermissionsTable_').attr('filepath', selected_file);
    console.log("Current File: ", selected_file);
});

$('#sidepanel').append(new_file_field);
$('#sidepanel').append(new_user_field);

var new_dialog = define_new_dialog('newDialog_', title='Info', options = {})

$('.perm_info').on('click', function() {
    new_dialog.dialog('open')

    let currentUsername = $('#newPermissionsTable_').attr('username');
    let currentFilePath = $('#newPermissionsTable_').attr('filepath');
    let permissionType = $(this).attr('permission_name');
    console.log("Current Username: ", currentUsername);
    console.log("Current Filepath: ", currentFilePath);
    console.log("Permission Type: ", permissionType);

    // Getting file and user objects
    let fileObject = path_to_file[currentFilePath];
    let userObject = all_users[currentUsername];

    // Checking if the action is allowed and getting the explanation
    let allowAction = allow_user_action(fileObject, userObject, permissionType, true);

    let explanation = get_explanation_text(allowAction);

    // Appending the explanation text to the dialog
    $('#newDialog_').empty().append(explanation);


});

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 