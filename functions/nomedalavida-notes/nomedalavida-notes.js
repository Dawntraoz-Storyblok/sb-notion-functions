const { Client } = require("@notionhq/client")

exports.handler = async function (event, context) {
  const notionClient = new Client({ auth: process.env.NOTION_NMDLV_KEY });

  const notesProdPage = (await notionClient.blocks.children.list({
    block_id: process.env.NOTION_NMDLV_ID,
    page_size: 50,
  })).results;
  const podcastSeasons = notesProdPage.filter(block => block.callout);

  const episodeNotes = {};

  podcastSeasons.map(async version => {
    const episodeNotesByVersion = await notionClient.blocks.children.list({
      block_id: version.id,
      page_size: 50,
    });
    episodeNotes[version.callout.rich_text] = episodeNotesByVersion.results.map(episode => ({
      notion_id: episode.id,
      title: episode.child_page.title
    }));
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    },
    body: JSON.stringify(episodeNotes)
  }
}