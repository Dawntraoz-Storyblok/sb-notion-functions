const { Client } = require("@notionhq/client")

exports.handler = async function (event, context) {
  const notionClient = new Client({ auth: process.env.NOTION_KEY });
  const database = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  const posts = [];

  database.results.map(item => {
    posts.push({
      id: item.id,
      title: item.properties.Title.title[0].text.content,
      publicationDate: item.properties["Publication date"].date.start,
      link: item.properties.Link.url,
      tags: item.properties.Tags.multi_select.map(tag => tag.name),
    });
  });

  return {
    statusCode: 200,
    body: JSON.stringify(posts)
  }
}