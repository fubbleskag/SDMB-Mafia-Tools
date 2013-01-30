jQuery(document).ready(function($){

	storage = chrome.storage.local; // Prepare storage object

	mtbInit(); // Prepare the toolbar

	mtbPageAction(); // Toggle toolbar when page action icon clicked

});

function mtbInit() {

	console.log("Toolbar initializing...");

	// Add empty toolbar to the DOM

		mafiaToolbar = $('<div id="mafiaToolbar">');
		mafiaToolbar.hide();
		$('body').prepend(mafiaToolbar);

	// Check if toolbar has been previously enabled

		storage.get('mtbVisible', function(values){
			if (values.mtbVisible) {
				mtbShow();
			}
		});

}

function mtbPageAction() {

	// Listen for request from the page action button to toggle the toolbar

		chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
			if (request.greeting == "toggleToolbar") {
				if ( $('#mafiaToolbar').is(':visible') ) {
					mtbHide();
				} else {
					mtbShow();
				}
			}
		});

}

function mtbShow() {

	console.log("Toolbar activated.");

	// Display the toolbar

		mafiaToolbar = $('#mafiaToolbar');
		mafiaToolbar.html("Toolbar!");
		mafiaToolbar.show(500);
		storage.set( { 'mtbVisible': true } );

	// Add filter classes to current page's posts

		$('#posts').mtbFilters();

	// Load posts from all thread's pages in background, adding filter classes

		if ( $('#allPosts').length == 0 ) {
			allPosts = $('<div id="allPosts">');
			allPosts.hide();
			$('#posts').after(allPosts);
			lastPage = $('.vbmenu_control:contains("Page")').html().split(' ').pop();
			baseURL = $('#posts').prev().find('a.smallfont').attr('href').split('&page=')[0];
			for (currentPage = 1; currentPage <= lastPage; currentPage++) {
				console.log("Retrieving Page " + currentPage + " of " + lastPage);
				allPosts.append('<div class="posts" id="page-'+currentPage+'">');
				url = baseURL + '&page=' + currentPage;
				$('#page-' + currentPage).load(url+' #posts > div', function(data){
					console.log( "Loaded " + $(data).find('.vbmenu_control:contains("Page")')[0].innerHTML );
					$('#allPosts').mtbFilters();
				});
			}
		}

}

function mtbHide() {

	console.log("Toolbar deactivated.");

	// Hide the toolbar

		mafiaToolbar = $('#mafiaToolbar');
		mafiaToolbar.hide(500);
		storage.set( { 'mtbVisible': false } );

}

function formatUsername(username) {
	return username.toLowerCase().replace(" ", "_").replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
}

/* jQuery Extensions */

	// .mtbFilters()

		jQuery.fn.extend({
			'mtbFilters': function(){
				// Kill advertisements
					$(this).find('td.thead:containsNC("Advertisements")').closest('div[align="center"]').remove();
				// Add filter classes to posts
					$(this).find('table[id^="post"]').each(function(index){
						// General utility tag
							var post = $(this).closest('div[align="center"]');
							post.addClass('mtb-post');
						// Username
							var username = formatUsername($(this).find('a.bigusername').html());
							post.addClass('mtb-' + username);
						// Online status
							var status = $(this).find('a.bigusername').next('img').attr('src').match(/(on|off)line/);
							post.addClass('mtb-' + status[0]);
						// (Un)votes
							var votes = $(this).find('font[color*="blue"]:containsNC("vote"):not("div.smallfont + table font"), b:containsNC("vote"):not("div.smallfont + table b"):not(b:containsNC("unvote"))');
							var unvotes = $(this).find('font[color*="red"]:containsNC("unvote"):not("div.smallfont + table font"), b:containsNC("unvote"):not("div.smallfont + table b")');
							if ( votes.length ) post.addClass('mtb-vote');
							if ( unvotes.length ) post.addClass('mtb-unvote');
					});
			}
		});

	// :containsNC

		jQuery.expr[":"].containsNC = $.expr.createPseudo(function(arg) {
			return function( elem ) {
				return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
			};
		});
