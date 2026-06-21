<?php

namespace App\Http\Controllers;

use App\Models\KanbanList;
use Illuminate\Http\Request;

class KanbanListController extends Controller
{
    public function index()
    {
        return response()->json(KanbanList::with('cards')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
            'position' => 'integer'
        ]);

        $list = KanbanList::create($validated);

        return response()->json($list->load('cards'), 201);
    }

    public function show(KanbanList $kanbanList)
    {
        return response()->json($kanbanList->load('cards'));
    }

    public function update(Request $request, KanbanList $kanbanList)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|integer'
        ]);

        $kanbanList->update($validated);

        return response()->json($kanbanList->load('cards'));
    }

    public function destroy(KanbanList $kanbanList)
    {
        $kanbanList->delete();
        return response()->json(null, 204);
    }
}
