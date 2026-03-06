import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import authAiOptional from '../middleware/authAiOptional.js';
import authAny from '../middleware/authAny.js';
import { ingestDocument, semanticSearch } from '../controllers/searchController.js';
import { globalSearch } from '../controllers/globalSearchController.js';

const searchRouter = express.Router();

searchRouter.post('/ingest', authAdmin, ingestDocument);
searchRouter.get('/semantic', authAiOptional, semanticSearch);
searchRouter.post('/semantic', authAiOptional, semanticSearch);
searchRouter.get('/global', authAny, globalSearch);

export default searchRouter;
