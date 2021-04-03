<?php

/**
 * Plugin Name:     RN News Block
 * Description:     News Feed Implementation as Gutenberg block
 * Version:         1.0.0
 * Author:          Raghav Narang
 * Text Domain:     rn-news-block
 *
 * @package         rn-news-block
 */

function rn_render_news_block($attributes)
{
	/** Due to a bug in block API, it is adding the render data in Rest API Call
	 * Return on such situation
	 */
	if (did_action('rest_api_init')) {
		return;
	}

	$topic = isset($attributes['topic']) ? $attributes['topic'] : '';
	if (empty($topic)) {
		_e('<p>No topic found to search</p>', 'rn-news-block');
		return;
	}

	$per_page = isset($attributes['perPage']) ? $attributes['perPage'] : 10;
	$page = isset($attributes['page']) ? $attributes['page'] : 1;
	$result = rn_get_news_feed_from_api($topic, $per_page, $page);
	if (is_wp_error($result) || !is_array($result) || !isset($result['body']) || empty($result['body'])) {
		_e('<p>Unable to load News</p>', 'rn-news-block');
		return;
	}

	$result = json_decode($result['body'], true);
?>
	<div className="rn-news-wrapper">
		<div className="rn-news">
			<?php
			foreach ($result['articles'] as $article) {
			?>
				<article className="rn-article">
					<?php if (isset($article['urlToImage']) && !empty($article['urlToImage'])) {
						echo '<img src="' . $article['urlToImage'] . '" />';
					} ?>
					<div>
						<?php if (isset($article['title']) && !empty($article['title'])) {
						?>
							<a href="<?php echo $article['url']; ?>">
								<h4><?php echo $article['title']; ?></h4>
							</a>
						<?php
						} ?>

						<?php if (isset($article['content']) && !empty($article['content'])) {
							echo '<p>' . $article['content'] . '</p>';
						} ?>

						<?php if (isset($article['source']) && is_array($article['source']) && isset($article['source']['name'])) {
							echo '<small>' . __('Source: ', 'rn-news-block') . $article['source']['name'] . '</small>';
						} ?>
						<br />
						<br />
						<hr />
						<br />
					</div>
				</article>
			<?php
			}
			?>
		</div>
	</div>
<?php
}

function create_block_news_block_gutenberg_block_init()
{
	register_block_type_from_metadata(
		__DIR__,
		array(
			'render_callback' => 'rn_render_news_block',
		)
	);
}
add_action('init', 'create_block_news_block_gutenberg_block_init');

function rn_get_news_feed()
{
	$page = isset($_GET['page']) && !empty($_GET['page']) ? absint(sanitize_key($_GET['page'])) : 1;
	$per_page = isset($_GET['perPage']) && !empty($_GET['perPage']) ? absint(sanitize_key($_GET['perPage'])) : 10;
	$topic = isset($_GET['topic']) && !empty($_GET['topic']) ? sanitize_text_field($_GET['topic']) : 10;
	$result = rn_get_news_feed_from_api($topic, $per_page, $page);
	if (is_wp_error($result)) {
		wp_send_json_error($result, 500);
	}

	if (empty($result['body'])) {
		wp_send_json_error(new WP_Error(500, __('No Body found', 'rn-news-block')), 500);
	}

	wp_send_json(json_decode($result['body'], true));
}

function rn_get_news_feed_from_api($topic = '', $per_page = 10, $page = 1)
{
	return wp_remote_get("https://newsapi.org/v2/everything?q={$topic}&pageSize={$per_page}&page={$page}&apiKey=a340fe58a40142a28d011fa0b3298ce8", [
		'timeout'     => 10,
		'sslverify' => false
	]);
}

function rn_api_permission_callback()
{
	return current_user_can('manage_options');
}

add_action('rest_api_init', function () {
	register_rest_route('rn/v1', 'news', [
		'method' => 'GET',
		'callback' => 'rn_get_news_feed',
		'permission_callback' => 'rn_api_permission_callback'
	]);
});
