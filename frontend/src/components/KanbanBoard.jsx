import { useState, useEffect } from 'react';
import axios from 'axios';

// API instance configured for Laravel Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default function KanbanBoard() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Card Modals State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  
  // Card Fields State
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [cardLabels, setCardLabels] = useState('');
  const [cardAssignee, setCardAssignee] = useState('');
  const [cardDueDate, setCardDueDate] = useState('');
  
  // Column Modals State
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listName, setListName] = useState('');
  
  // Board Modals State
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState('');

  // Drag and Drop State
  const [draggedCardId, setDraggedCardId] = useState(null);

  // Fetch all boards
  async function fetchBoards() {
    setLoading(true);
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
      if (response.data.length > 0) {
        // Set the first board as active
        handleSelectBoard(response.data[0]);
      } else {
        // Auto-create a default board if none exists
        const defaultBoard = await api.post('/boards', { name: 'Main Product Workspace' });
        setBoards([defaultBoard.data]);
        handleSelectBoard(defaultBoard.data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  }

  // Load Boards on Mount
  useEffect(() => {
    fetchBoards();
  }, []);

  // Select board and load its columns & cards
  const handleSelectBoard = (board) => {
    setCurrentBoard(board);
    if (board && board.kanban_lists) {
      setLists(board.kanban_lists);
    } else {
      setLists([]);
    }
  };

  // Fetch lists for the current board
  const refreshBoardData = async () => {
    if (!currentBoard) return;
    try {
      const response = await api.get(`/boards/${currentBoard.id}`);
      setCurrentBoard(response.data);
      setLists(response.data.kanban_lists || []);
      // Update boards list as well
      setBoards(boards.map(b => b.id === response.data.id ? response.data : b));
    } catch (error) {
      console.error('Error refreshing board data:', error);
    }
  };

  // Create Board
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardName.trim()) return;
    try {
      const res = await api.post('/boards', { name: boardName });
      setBoards([...boards, res.data]);
      handleSelectBoard(res.data);
      setBoardName('');
      setIsBoardModalOpen(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  // Create List/Column
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName.trim() || !currentBoard) return;
    try {
      const res = await api.post('/kanban-lists', {
        board_id: currentBoard.id,
        name: listName,
        position: lists.length
      });
      setLists([...lists, res.data]);
      setListName('');
      setIsListModalOpen(false);
      refreshBoardData();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  // Delete List/Column
  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this column and all its cards?')) return;
    try {
      await api.delete(`/kanban-lists/${listId}`);
      setLists(lists.filter(l => l.id !== listId));
      refreshBoardData();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  // Open Card Modal (Create)
  const openCreateCardModal = (listId) => {
    setEditingCard(null);
    setSelectedListId(listId);
    setCardTitle('');
    setCardDesc('');
    setCardLabels('');
    setCardAssignee('');
    setCardDueDate('');
    setIsCardModalOpen(true);
  };

  // Open Card Modal (Edit)
  const openEditCardModal = (card) => {
    setEditingCard(card);
    setSelectedListId(card.kanban_list_id);
    setCardTitle(card.title || '');
    setCardDesc(card.description || '');
    setCardLabels(card.labels_csv || '');
    setCardAssignee(card.assigned_member || '');
    setCardDueDate(card.due_date ? card.due_date.substring(0, 16) : '');
    setIsCardModalOpen(true);
  };

  // Create or Update Card
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    const payload = {
      kanban_list_id: selectedListId,
      title: cardTitle,
      description: cardDesc,
      labels_csv: cardLabels,
      assigned_member: cardAssignee,
      due_date: cardDueDate ? new Date(cardDueDate).toISOString() : null,
    };

    try {
      if (editingCard) {
        // Update Card
        await api.put(`/cards/${editingCard.id}`, payload);
      } else {
        // Create Card
        payload.position = (lists.find(l => l.id === selectedListId)?.cards?.length || 0);
        await api.post('/cards', payload);
      }
      setIsCardModalOpen(false);
      refreshBoardData();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      setIsCardModalOpen(false);
      refreshBoardData();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    const cardId = draggedCardId || e.dataTransfer.getData('text/plain');
    if (!cardId || !targetListId) return;

    try {
      // Find card in local state to update its column
      await api.put(`/cards/${cardId}`, {
        kanban_list_id: targetListId
      });
      refreshBoardData();
    } catch (error) {
      console.error('Error moving card:', error);
    } finally {
      setDraggedCardId(null);
    }
  };

  // Quick Move Card (Buttons fallback for touch/accessibility)
  const handleMoveCard = async (cardId, targetListId) => {
    try {
      await api.put(`/cards/${cardId}`, {
        kanban_list_id: targetListId
      });
      refreshBoardData();
    } catch (error) {
      console.error('Error moving card:', error);
    }
  };

  // Get all unique tags from current board
  const getUniqueLabels = () => {
    const labels = new Set();
    lists.forEach(list => {
      list.cards?.forEach(card => {
        if (card.labels_csv) {
          card.labels_csv.split(',').forEach(l => {
            const trimmed = l.trim();
            if (trimmed) labels.add(trimmed);
          });
        }
      });
    });
    return Array.from(labels);
  };

  // Filter & Search Logic
  const getFilteredCards = (cards = []) => {
    return cards.filter(card => {
      const matchesSearch = 
        card.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.assigned_member?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLabel = 
        !selectedLabelFilter || 
        (card.labels_csv && card.labels_csv.split(',').map(l => l.trim().toLowerCase()).includes(selectedLabelFilter.toLowerCase()));

      return matchesSearch && matchesLabel;
    });
  };

  // Get color for label tags dynamically based on hash/name
  const getLabelColorClass = (label = '') => {
    const lower = label.trim().toLowerCase();
    if (lower.includes('bug') || lower.includes('hotfix') || lower.includes('critical')) return 'card-tag-red';
    if (lower.includes('feat') || lower.includes('develop') || lower.includes('new')) return 'card-tag-green';
    if (lower.includes('test') || lower.includes('qa') || lower.includes('review')) return 'card-tag-yellow';
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) return 'card-tag-purple';
    return 'card-tag-blue';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>⚡ Loading Kanban System...</div>
          <div style={{ color: 'var(--text-secondary)' }}>Connecting securely to SQLite database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#c084fc' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
          </svg>
          Forge Kanban Studio
        </div>
        
        {/* Board Selection */}
        <div className="board-select-container">
          <span className="board-select-label">Workspace:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '200px' }}
            value={currentBoard?.id || ''}
            onChange={(e) => {
              const selected = boards.find(b => b.id === Number(e.target.value));
              if (selected) handleSelectBoard(selected);
            }}
          >
            {boards.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => setIsBoardModalOpen(true)}>➕ New Board</button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="controls-bar glass-panel">
        {/* Search */}
        <div className="filter-group">
          <input 
            type="text" 
            placeholder="🔍 Search cards, descriptions..." 
            className="form-input search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Labels */}
        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Tag:</span>
          <select 
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedLabelFilter}
            onChange={(e) => setSelectedLabelFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {getUniqueLabels().map(lbl => (
              <option key={lbl} value={lbl}>{lbl}</option>
            ))}
          </select>
          {selectedLabelFilter && (
            <button className="btn btn-secondary" onClick={() => setSelectedLabelFilter('')}>Clear</button>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => setIsListModalOpen(true)}>➕ Add Column</button>
      </div>

      {/* Kanban Canvas */}
      <div className="board-canvas">
        {lists.map(list => {
          const listCards = getFilteredCards(list.cards || []);
          return (
            <div 
              key={list.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  {list.name}
                  <span className="column-count">{listCards.length}</span>
                </div>
                <button 
                  className="btn" 
                  style={{ background: 'none', color: 'var(--text-secondary)', padding: '0.2rem' }}
                  onClick={() => handleDeleteList(list.id)}
                  title="Delete column"
                >
                  ❌
                </button>
              </div>

              <div className="card-list">
                {listCards.map(card => (
                  <div 
                    key={card.id} 
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onClick={() => openEditCardModal(card)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="card-title">{card.title}</div>
                    </div>
                    
                    {card.description && (
                      <div className="card-desc">{card.description}</div>
                    )}
                    
                    {card.labels_csv && (
                      <div className="card-tags">
                        {card.labels_csv.split(',').map(lbl => {
                          const tag = lbl.trim();
                          if (!tag) return null;
                          return (
                            <span key={tag} className={`card-tag ${getLabelColorClass(tag)}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="card-assignee">
                        {card.assigned_member ? `👤 ${card.assigned_member}` : '👤 Unassigned'}
                      </div>
                      
                      {card.due_date && (
                        <div className={`card-due ${new Date(card.due_date) < new Date() ? 'overdue' : ''}`}>
                          📅 {new Date(card.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Quick Move controls */}
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 'auto' }}>Move:</span>
                      {lists.map(targetList => {
                        if (targetList.id === list.id) return null;
                        return (
                          <button 
                            key={targetList.id}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.65rem', padding: '0.15rem 0.3rem' }}
                            onClick={() => handleMoveCard(card.id, targetList.id)}
                          >
                            {targetList.name.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '1rem', width: '100%', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }}
                onClick={() => openCreateCardModal(list.id)}
              >
                ➕ Add Card
              </button>
            </div>
          );
        })}
      </div>

      {/* Card Edit/Create Modal */}
      {isCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCardModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCard ? '✏️ Edit Card' : '➕ Add Card'}</h3>
              <button className="btn" style={{ background: 'none', color: '#fff' }} onClick={() => setIsCardModalOpen(false)}>❌</button>
            </div>
            
            <form onSubmit={handleSaveCard}>
              <div className="form-group">
                <label className="form-label">Card Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardTitle} 
                  onChange={(e) => setCardTitle(e.target.value)} 
                  required 
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  value={cardDesc} 
                  onChange={(e) => setCardDesc(e.target.value)}
                  placeholder="Add detailed task specs here..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Labels / Tags (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardLabels} 
                  onChange={(e) => setCardLabels(e.target.value)}
                  placeholder="e.g. Bug, High Priority, Feature"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Member</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardAssignee} 
                  onChange={(e) => setCardAssignee(e.target.value)}
                  placeholder="e.g. Abhinav Dhawan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={cardDueDate} 
                  onChange={(e) => setCardDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                {editingCard && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ marginRight: 'auto' }}
                    onClick={() => handleDeleteCard(editingCard.id)}
                  >
                    🗑️ Delete Card
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setIsCardModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Create Modal */}
      {isListModalOpen && (
        <div className="modal-overlay" onClick={() => setIsListModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Create New Column</h3>
              <button className="btn" style={{ background: 'none', color: '#fff' }} onClick={() => setIsListModalOpen(false)}>❌</button>
            </div>
            
            <form onSubmit={handleCreateList}>
              <div className="form-group">
                <label className="form-label">Column Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={listName} 
                  onChange={(e) => setListName(e.target.value)} 
                  required 
                  placeholder="e.g. In Progress, Review"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsListModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Column</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Board Create Modal */}
      {isBoardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBoardModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Create New Board</h3>
              <button className="btn" style={{ background: 'none', color: '#fff' }} onClick={() => setIsBoardModalOpen(false)}>❌</button>
            </div>
            
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label className="form-label">Board Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={boardName} 
                  onChange={(e) => setBoardName(e.target.value)} 
                  required 
                  placeholder="e.g. Marketing Sprint, Dev Phase 1"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsBoardModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Board</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
