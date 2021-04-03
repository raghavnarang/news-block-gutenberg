import { __ } from "@wordpress/i18n";
import {
	TextControl,
	Flex,
	FlexBlock,
	Spinner,
	__experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import useNewsAPI from "./useNewsApi";

import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
	const { topic, perPage, page } = !!attributes ? attributes : {};
	const { isLoading, articles, error } = useNewsAPI(topic, perPage, page);

	return (
		<div
			{...useBlockProps({
				className: "rn-news-block",
			})}
		>
			<InspectorControls>
				<div className="rn-news-block-settings">
					<hr />
					<div className="rn-settings-inner">
						<TextControl
							label={__("Search news topic", "rn-news-block")}
							value={topic}
							onChange={(val) => setAttributes({ topic: val })}
						/>
						<Flex>
							<FlexBlock>
								<NumberControl
									label={__("Number of topics", "rn-news-block")}
									value={perPage}
									onChange={(val) => setAttributes({ perPage: parseInt(val) })}
								/>
							</FlexBlock>
							<FlexBlock>
								<NumberControl
									label={__("Page Number", "rn-news-block")}
									value={page}
									onChange={(val) => setAttributes({ page: parseInt(val) })}
								/>
							</FlexBlock>
						</Flex>
					</div>
				</div>
			</InspectorControls>

			<div className="rn-news-wrapper">
				<div className="rn-news">
					{/** Error State */}
					{!!error && <p>{error}</p>}

					{/** Loading State */}
					{!!isLoading && <Spinner />}

					{/** Articles */}
					{!error &&
						!isLoading &&
						Array.isArray(articles) &&
						articles.map((article) => (
							<article key={article.title} className="rn-article">
								{!!article.urlToImage && <img src={article.urlToImage} />}
								<div>
									{!!article.title && (
										<a href={!!article.url ? article.url : "#"}>
											<h4>{article.title}</h4>
										</a>
									)}
									{!!article.content && <p>{article.content}</p>}

									{!!article.source && !!article.source.name && (
										<small>
											{__("Source: ", "rn-news-block")}
											{article.source.name}
										</small>
									)}
									<hr />
								</div>
							</article>
						))}
				</div>
			</div>
		</div>
	);
}
