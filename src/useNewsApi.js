import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from "@wordpress/element";
import { stringify } from "qs";

const useNewsAPI = (topic, perPage, page) => {
	const [isLoading, setLoading] = useState(false);
	const [articles, setArticles] = useState([]);
	const [error, setError] = useState("");

	const fetchNews = async () => {
		const data = { topic, perPage, page };
		setLoading(true);
		try {
			const result = await apiFetch({
				method: "GET",
				path: `rn/v1/news&${stringify(data)}`,
			});

			if (!!result && !!result.articles) {
				setArticles(result.articles);
			} else {
				setError(__("No articles found", "rn-news-block"));
			}
		} catch (e) {
			setError(
				!!e && !!e.message
					? e.message
					: __("Unable to load News Feed", "rn-news-block")
			);
		}
		setLoading(false);
	};

	const timeout = useRef();
	useEffect(() => {
		if (!topic) {
			setError(__("Enter a topic in block settings", "rn-news-block"));
		} else {
			setError("");
			if (!!timeout.current) {
				clearTimeout(timeout.current);
			}

			timeout.current = setTimeout(() => {
				fetchNews();
			}, 500);
		}
	}, [topic, perPage, page]);

	return { isLoading, articles, error };
};

export default useNewsAPI;
