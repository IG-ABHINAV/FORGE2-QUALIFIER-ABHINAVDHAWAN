<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_kanban_crud_flow(): void
    {
        $board = $this->postJson('/api/boards', [
            'name' => 'Qualifier Sprint',
        ])->assertCreated()->json();

        $list = $this->postJson('/api/kanban-lists', [
            'board_id' => $board['id'],
            'name' => 'In Progress',
            'position' => 0,
        ])->assertCreated()->json();

        $card = $this->postJson('/api/cards', [
            'kanban_list_id' => $list['id'],
            'title' => 'Ship the demo',
            'description' => 'Verify the full API flow.',
            'labels_csv' => 'Feature,Review',
            'assigned_member' => 'Abhinav Dhawan',
            'due_date' => '2026-06-21T17:00:00+05:30',
            'position' => 0,
        ])->assertCreated()
            ->assertJsonPath('title', 'Ship the demo')
            ->assertJsonPath('assigned_member', 'Abhinav Dhawan')
            ->json();

        $this->getJson("/api/kanban-lists/{$list['id']}")
            ->assertOk()
            ->assertJsonPath('cards.0.id', $card['id']);

        $this->putJson("/api/cards/{$card['id']}", [
            'title' => 'Ship the verified demo',
        ])->assertOk()
            ->assertJsonPath('title', 'Ship the verified demo');

        $this->getJson("/api/boards/{$board['id']}")
            ->assertOk()
            ->assertJsonPath('kanban_lists.0.cards.0.title', 'Ship the verified demo');

        $this->deleteJson("/api/cards/{$card['id']}")->assertNoContent();
        $this->deleteJson("/api/kanban-lists/{$list['id']}")->assertNoContent();
        $this->deleteJson("/api/boards/{$board['id']}")->assertNoContent();
    }

    public function test_card_requires_a_valid_list_and_title(): void
    {
        $this->postJson('/api/cards', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['kanban_list_id', 'title']);
    }
}
