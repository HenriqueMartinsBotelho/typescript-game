interface PageViewPayload {
  page_url: string;
}

interface ButtonClickPayload {
  button_id: string;
  page_url: string;
}

export const trackPageView = async (pageUrl: string): Promise<void> => {
  const payload: PageViewPayload = { page_url: pageUrl };

  try {
    const response = await fetch("/api/api/page-views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Failed to track page view:", response.statusText);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error tracking page view:", error.message);
    } else {
      console.error("Error tracking page view:", error);
    }
  }
};

export const trackButtonClick = async (
  buttonId: string,
  pageUrl: string
): Promise<void> => {
  const payload: ButtonClickPayload = {
    button_id: buttonId,
    page_url: pageUrl,
  };

  try {
    const response = await fetch("/api/api/button-clicks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Failed to track button click:", response.statusText);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error tracking button click:", error.message);
    } else {
      console.error("Error tracking button click:", error);
    }
  }
};
