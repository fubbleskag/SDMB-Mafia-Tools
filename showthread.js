/* Comment test */

jQuery(document).ready(function($){

	$('body').mtbFilters();

	/* Get stored options */

		storage = chrome.storage.local;
		mtbOptions = {};
		storage.get('mtbOptions', function(values){ mtbOptions = values.mtbOptions; });
		//storage.set( { 'mtbOptions': mtbOptions } );


	/* Build the Toolbar */

		mafiaToolbar = $('<div id="mafiaToolbar">');
		mafiaToolbar.html("Toolbar!");
		mafiaToolbar.hide();
		$('body').prepend(mafiaToolbar);

	/* Toggle the Toolbar */

		chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
			if (request.greeting == "toggleToolbar") {
				mafiaToolbar.slideToggle(400);
			}
		});

	/* Load other pages of thread in the background */

		allPosts = $('<div id="allPosts">');
		allPosts.hide();
		$('#posts').after(allPosts);
		lastPage = $('.vbmenu_control:contains("Page")').html().split(' ').pop();
		baseURL = $('#posts').prev().find('a.smallfont').attr('href').split('&page=')[0];
		for (currentPage = 1; currentPage <= lastPage; currentPage++) {
			allPosts.append('<div class="posts" id="page-'+currentPage+'">');
			url = baseURL + '&page=' + currentPage;
			$('#page-' + currentPage).load(url+' #posts > div', function(data){
				$('#allPosts').mtbFilters();
			});
		}

});

function formatUsername(username) {
	return username.toLowerCase().replace(" ", "_").replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
}

jQuery.fn.extend({
	'mtbFilters': function(){
		$(this).find('td.thead:containsNC("Advertisements")').closest('div[align="center"]').remove();
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

jQuery.expr[":"].containsNC = $.expr.createPseudo(function(arg) {
	return function( elem ) {
		return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});
