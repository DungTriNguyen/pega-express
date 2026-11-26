import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/i18n/messages/vi.json";
import { TrackingForm } from "@/features/tracking";

const setup = () =>
  render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <TrackingForm zaloUrl="https://zalo.me/0773108989" />
    </NextIntlClientProvider>,
  );

describe("TrackingForm", () => {
  it("báo lỗi khi để trống", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /tra cứu/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Vui lòng nhập mã vận đơn");
  });

  it("nhận diện UPS và tạo link chính thức", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Mã vận đơn"), "1Z999AA10123456784");
    await userEvent.click(screen.getByRole("button", { name: /tra cứu/i }));
    const link = await screen.findByRole("link", { name: /Mở trang tra cứu UPS/ });
    expect(link).toHaveAttribute("href", expect.stringContaining("ups.com/track"));
  });

  it("mã không nhận diện được → gợi ý gửi Zalo", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Mã vận đơn"), "ABCDEFGHIJ");
    await userEvent.click(screen.getByRole("button", { name: /tra cứu/i }));
    expect(await screen.findByText(/Chưa nhận diện được hãng/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gửi mã qua Zalo/ })).toHaveAttribute("href", "https://zalo.me/0773108989");
  });
});
