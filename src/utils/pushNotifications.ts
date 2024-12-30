interface PushNotificationData {
  title: string;
  body: string;
  gameData?: {
    gameId?: string;
    [key: string]: any;
  };
}

export const sendPushNotification = async (userId: string, notificationData: PushNotificationData) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('push_subscription')
      .eq('did', userId)
      .single();

    if (userError) {
      console.error('Error fetching user subscription:', userError);
      return;
    }

    if (!userData?.push_subscription) {
      console.log('No push subscription found for user:', userId);
      return;
    }

    const subscription = JSON.parse(userData.push_subscription);
    const payload = JSON.stringify(notificationData);

    await fetch('/api/push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        payload
      })
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const createGameNotification = (
  gameId: string,
  playerName: string,
  type: 'move' | 'win' | 'lose' | 'draw'
): PushNotificationData => {
  switch (type) {
    case 'move':
      return {
        title: 'New Move Played!',
        body: `${playerName} has made their move in your game!`,
        gameData: { gameId }
      };
    case 'win':
      return {
        title: 'Victory!',
        body: `You won against ${playerName}!`,
        gameData: { gameId }
      };
    case 'lose':
      return {
        title: 'Game Over',
        body: `You lost against ${playerName}.`,
        gameData: { gameId }
      };
    case 'draw':
      return {
        title: 'Game Draw',
        body: `Your game with ${playerName} ended in a draw.`,
        gameData: { gameId }
      };
  }
};