const { Client } = require("@notionhq/client")

exports.handler = async function (event, context) {
  const notionClient = new Client({ auth: process.env.NOTION_NMDLV_KEY });

  let notesProdPage = [];
  try {
    notesProdPage = (await notionClient.blocks.children.list({
      block_id: process.env.NOTION_NMDLV_ID,
      page_size: 50,
    })).results;
  } catch (error) {
    console.error(error);
  }
  const podcastSeasons = notesProdPage.filter(block => block.callout);

  const episodeNotes = await podcastSeasons.reduce(async (acc, version) => {
    try {
      const episodeNotesByVersion = await notionClient.blocks.children.list({
        block_id: version.id,
        page_size: 50,
      });
      return {
        ...(await acc),
        [version.callout.rich_text[0].plain_text.replaceAll(' ', '-').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')]: episodeNotesByVersion.results.map(episode => ({
          notion_id: episode.id,
          title: episode.child_page.title
        }))
      };
    } catch (error) {
      console.error(error);
    }
  }, {});

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