/**
 * Created by lukedowell on 7/24/15.
 */

var OAUTH_ID = "your oauth id";
var GIT_URL = "https://api.github.com/";
var ENTER_KEY = 13;

//Why can't I put these here? If I try to prepend these to elements in my buildusercard,
//it seems like JQuery will only allow one 'instance' of these variables

//var $EMAIL_ICON = $("<span/>", {
//    class: "glyphicon glyphicon-envelope",
//    'aria-hidden': 'true'
//});
//var $LOC_ICON = $("<span/>", {
//    class: "glyphicon glyphicon-globe",
//    'aria-hidden': 'true'
//});
//var $REPO_ICON = $("<span/>", {
//    class: "glyphicon glyphicon-blackboard",
//    'aria-hidden': 'true'
//});


/**
 * Entry point
 */
$(document).ready(function() {

    //Attach event handlers
    $(".dropdownVal").on('click', function() {
        $("#searchButton").text($(this).text());
    });

    $("#searchButton").on('click', function() {
        searchHandler();
    });

    $("#searchField").keypress(function(event) {
        if(event.keyCode === ENTER_KEY) {
            searchHandler()
        }
    });

    $(".card-wrapper").on('click', '.repoLink', function(event) {
        event.preventDefault();
        var username = $(this).data("login");
        gitRequest(username, "users", "repos");
    });

    $(".close").on('click', function() {
        $(".modal").hide();
    });
});

/**
 * Handles our search event
 * @param input
 *      The input from #searchField
 * @param searchType
 *      The type of search, org or user
 */
function searchHandler() {
    var searchType = $("#searchButton").text().toLowerCase();
    var searchTerm = $("#searchField").val().toLowerCase();
    //var options = "";
    gitRequest(searchTerm, searchType);
}

/**
 * Makes a github api request
 * @param name
 *      The name of the organization or user we are trying to pull
 * @param api
 *      The API we are targeting. Orgs or Users
 * @param options
 */
function gitRequest(name, api, options) {
    var requestMod = "";
    if(options != undefined) {
        requestMod += "/" + options;
    }
    $.ajax(GIT_URL + api + "/" + name + requestMod, {
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        timeout: 5000,
        data: {
            client_id: OAUTH_ID
        },

        success: function(response) {
            console.log(response);
            if(api == "users") {
                if(options === undefined) {
                    $(".card-wrapper").prepend(buildUserCard(response));
                } else if(options === "repos") {
                    $("#repoModalBody").html(populateRepoModal(response));
                    $(".modal").show();
                }
            }
        },

        error: function() {
            console.log("Some error is happening");
        },

        statusCode: {
            404: function() {
                alert("Are you sure the organization exists?");
            }
        }
    });
}

/**
 * Builds our DOM elements
 * @param user
 *      The GitHub user's information in JSON format
 *
 */
function buildUserCard(user) {

    var $EMAIL_ICON = $("<span/>", {class: "glyphicon glyphicon-envelope", 'aria-hidden': 'true'});
    var $LOC_ICON = $("<span/>", {class: "glyphicon glyphicon-globe", 'aria-hidden': 'true'});
    var $REPO_ICON = $("<span/>", { class: "glyphicon glyphicon-blackboard", 'aria-hidden': 'true'});

    //Create our objects
    var $cardWrapper = $("<div/>", {class:"col-md-4"});
    var $panel = $("<div/>", {class:"panel panel-primary"});
    var $panelHead = $("<div/>", {class:"panel-heading"});
    var $panelBody = $("<div/>", {class:"panel-body"});

    var $userBlog = $("<a/>", {href: user.blog, text: " " + user.login});
    var $userName = $("<h3/>").append($userBlog);
    var $userImg = $("<img/>", {src: user.avatar_url});
    var $userRepos = $("<p/>", {text: " public repos: "}).prepend($REPO_ICON);
    $userRepos.append($("<a/>", {class: "repoLink", text: user.public_repos, href: "#", 'data-login': user.login}));

    $panelHead.append($userImg);
    $panelHead.append($userName);


    if(user.company != null) {
        var $userCompany = $("<p/>", {text: user.company});
        $panelHead.append($userCompany);
    }

    if(user.location != null) {
        var $userLocation = $("<p/>", {text: ' ' + user.location}).prepend($LOC_ICON);
        $panelBody.append($userLocation);
    }

    if(user.email != null && user.email.length > 4) {
        var $userEmail = $("<p/>", {text: ' ' + user.email}).prepend($EMAIL_ICON);
        $panelBody.append($userEmail);
    }
    $panelBody.append($userRepos);


    //Stack them together
    $cardWrapper.append($panel);
    $panel.append($panelHead);
    $panel.append($panelBody);

    return $cardWrapper;
}

/**
 * Creates DOM elements with which we can populate our
 * repo modal dialog
 * @param data
 *    A user's /repos JSON data
 */
function populateRepoModal(data) {
    var $repoData = $("<div/>", {class: "repo-wrapper"});
    $.each(data, function(index, object) {
        $repoData.append($("<p/>", {text: object.name}))
    })
    return $repoData;
}
