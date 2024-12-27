'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CreateGame } from "@/components/multiplayer/CreateGame";
import { ActiveGames } from "@/components/multiplayer/ActiveGames";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MultiplayerPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Multiplayer</h1>
      
      <Tabs defaultValue="join" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="join">Join Game</TabsTrigger>
          <TabsTrigger value="create">Create Game</TabsTrigger>
        </TabsList>
        
        <TabsContent value="join">
          <Card className="p-4">
            <ActiveGames />
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card className="p-4">
            <CreateGame />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiplayerPage;