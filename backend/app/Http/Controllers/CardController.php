<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index()
    {
        return response()->json(Card::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kanban_list_id' => 'required|exists:kanban_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'labels_csv' => 'nullable|string',
            'assigned_member' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'integer'
        ]);

        $card = Card::create($validated);

        return response()->json($card, 201);
    }

    public function show(Card $card)
    {
        return response()->json($card);
    }

    public function update(Request $request, Card $card)
    {
        $validated = $request->validate([
            'kanban_list_id' => 'sometimes|required|exists:kanban_lists,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'labels_csv' => 'nullable|string',
            'assigned_member' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'sometimes|integer'
        ]);

        $card->update($validated);

        return response()->json($card);
    }

    public function destroy(Card $card)
    {
        $card->delete();
        return response()->json(null, 204);
    }
}
